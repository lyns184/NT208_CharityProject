import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Plus, Video } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { getOrganizers } from "@/api/user.api"
import {
  getVideos,
  likeVideo,
  unlikeVideo,
  recordVideoView,
} from "@/api/video.api"
import { VideoSoundProvider } from "@/contexts/VideoSoundContext"
import VideoFeedLayout from "@/components/video/VideoFeedLayout"
import { Skeleton } from "@/components/ui/skeleton"

function VideoFeedLoading() {
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#eaf5ef]">
      <div className="hidden w-[250px] border-r border-emerald-100 bg-white p-5 lg:block">
        <Skeleton className="h-10 w-40" />
        <div className="mt-8 space-y-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-center">
        <Skeleton className="h-[100dvh] w-full rounded-none bg-slate-300 lg:h-[85vh] lg:w-auto lg:aspect-[9/16] lg:rounded-xl" />
      </div>
    </div>
  )
}

function EmptyVideoFeed() {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-[#eaf5ef] px-5">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Video className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          Chưa có video nào
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Hãy đăng video đầu tiên để chia sẻ một hành trình thiện nguyện.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Trang chủ
          </Link>
          <Link
            to="/videos/create"
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Đăng video
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VideoFeed() {
  const { isAuthenticated } = useAuth()
  const viewedIdsRef = useRef(new Set())
  const [items, setItems] = useState([])
  const [organizers, setOrganizers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadFeed = async () => {
      setIsLoading(true)
      try {
        const [videosResult, organizersResult] = await Promise.allSettled([
          getVideos({ page: 1, limit: 30 }),
          getOrganizers({ limit: 20 }),
        ])
        if (cancelled) return

        if (videosResult.status === "fulfilled") {
          const payload = videosResult.value.data?.data || videosResult.value.data
          setItems(Array.isArray(payload?.videos) ? payload.videos : [])
        } else {
          setItems([])
        }

        if (organizersResult.status === "fulfilled") {
          const payload =
            organizersResult.value.data?.data || organizersResult.value.data
          const list = Array.isArray(payload) ? payload : payload?.organizers || []
          setOrganizers(
            list
              .slice()
              .sort(
                (a, b) =>
                  Number(b.totalRaised || 0) - Number(a.totalRaised || 0)
              )
          )
        } else {
          setOrganizers([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadFeed()
    return () => {
      cancelled = true
    }
  }, [])

  const handleLike = useCallback(
    async (videoId, shouldLike) => {
      if (!isAuthenticated) {
        toast.error("Vui lòng đăng nhập để thả tim")
        throw new Error("AUTH_REQUIRED")
      }

      let previousVideo = null
      setItems((current) =>
        current.map((video) => {
          if (video._id !== videoId) return video
          previousVideo = video
          const wasLiked = Boolean(video.likedByMe)
          const delta = shouldLike === wasLiked ? 0 : shouldLike ? 1 : -1
          return {
            ...video,
            likedByMe: shouldLike,
            likesCount: Math.max(Number(video.likesCount || 0) + delta, 0),
          }
        })
      )

      try {
        const response = shouldLike
          ? await likeVideo(videoId)
          : await unlikeVideo(videoId)
        const payload = response.data?.data || response.data
        setItems((current) =>
          current.map((video) =>
            video._id === videoId
              ? {
                  ...video,
                  likedByMe: Boolean(payload.liked),
                  likesCount: Number(payload.likesCount || 0),
                }
              : video
          )
        )
      } catch (error) {
        if (previousVideo) {
          setItems((current) =>
            current.map((video) =>
              video._id === videoId ? previousVideo : video
            )
          )
        }
        if (error.message !== "AUTH_REQUIRED") {
          toast.error(error.response?.data?.message || "Không thể cập nhật lượt thích")
        }
        throw error
      }
    },
    [isAuthenticated]
  )
  const handleView = useCallback(async (videoId) => {
    if (viewedIdsRef.current.has(videoId)) return
    viewedIdsRef.current.add(videoId)
    try {
      await recordVideoView(videoId)
      setItems((current) =>
        current.map((video) =>
          video._id === videoId
            ? { ...video, viewsCount: Number(video.viewsCount || 0) + 1 }
            : video
        )
      )
    } catch {
      viewedIdsRef.current.delete(videoId)
    }
  }, [])

  const handleCommentCreated = useCallback((videoId) => {
    setItems((current) =>
      current.map((video) =>
        video._id === videoId
          ? { ...video, commentsCount: Number(video.commentsCount || 0) + 1 }
          : video
      )
    )
  }, [])

  if (isLoading) return <VideoFeedLoading />
  if (!items.length) return <EmptyVideoFeed />

  return (
    <VideoSoundProvider>
      <VideoFeedLayout
        items={items}
        organizers={organizers}
        onLike={handleLike}
        onView={handleView}
        onCommentCreated={handleCommentCreated}
      />
    </VideoSoundProvider>
  )
}