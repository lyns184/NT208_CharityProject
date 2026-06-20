import { createElement, useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Volume2,
  VolumeX,
  Plus,
  Settings,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useVideoAutoPlayback } from "@/hooks/useVideoAutoPlayback"
import { useVideoSound } from "@/hooks/useVideoSound"
import { useAuth } from "@/hooks/useAuth"

function InteractionButton({
  label,
  icon: Icon,
  active = false,
  count,
  onClick,
  mobile = false,
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={
        mobile
          ? "flex w-12 flex-col items-center gap-1 text-white drop-shadow"
          : "flex w-14 flex-col items-center gap-1 text-slate-700"
      }
    >
      <span
        className={
          mobile
            ? "flex h-11 w-11 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm"
            : "flex h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-white shadow-sm transition hover:bg-emerald-50"
        }
      >
        {createElement(Icon, {
          className: `h-6 w-6 ${
            active ? "fill-rose-500 text-rose-500" : ""
          }`,
        })}
      </span>
      {count !== undefined && (
        <span className="text-xs font-semibold">{count}</span>
      )}
    </button>
  )
}

export default function VideoFeedItem({
  item,
  index,
  feedRef,
  registerItem,
  onActive,
  onLike,
  onComment,
  onView,
}) {
  const videoRef = useRef(null)
  const lastTapRef = useRef(0)
  const [captionExpanded, setCaptionExpanded] = useState(false)
  const [heartBurst, setHeartBurst] = useState(0)
  const { isMuted, toggleMuted } = useVideoSound()
  const { user, isAdmin } = useAuth()

  const handleActiveChange = useCallback(
    (active) => {
      if (active) onActive(index)
    },
    [index, onActive]
  )

  const isActive = useVideoAutoPlayback({
    videoRef,
    rootRef: feedRef,
    onActiveChange: handleActiveChange,
  })

  useEffect(() => {
    if (!isActive || !item._id) return
    const timer = window.setTimeout(() => onView?.(item._id), 3000)
    return () => window.clearTimeout(timer)
  }, [isActive, item._id, onView])

  const liked = Boolean(item.likedByMe)

  const updateLike = useCallback(
    (nextLiked) => {
      Promise.resolve(onLike?.(item._id, nextLiked)).catch(() => {})
    },
    [item._id, onLike]
  )

  const triggerHeart = useCallback(() => {
    if (!liked) updateLike(true)
    setHeartBurst(Date.now())
  }, [liked, updateLike])

  const handlePointerUp = (event) => {
    if (event.pointerType !== "touch") return
    if (event.target.closest("button, a")) return

    const now = Date.now()
    if (now - lastTapRef.current < 320) {
      triggerHeart()
      lastTapRef.current = 0
      return
    }
    lastTapRef.current = now
  }

  const author = item.authorId || {}
  const campaign = item.campaignId || null
  const commentCount = Number(item.commentsCount || 0)
  const likeCount = Number(item.likesCount || 0)
  const canManage =
    isAdmin ||
    (author._id && user?._id && author._id.toString() === user._id.toString())

  return (
    <article
      ref={(node) => registerItem(index, node)}
      className="relative flex h-[100dvh] w-full snap-center snap-always items-center justify-center overflow-hidden bg-[#eaf5ef] lg:px-4"
      onPointerUp={handlePointerUp}
      onDoubleClick={(event) => {
        if (!event.target.closest("button, a")) triggerHeart()
      }}
    >
      <div className="relative h-full w-full lg:flex lg:items-center lg:justify-center lg:gap-3">
        <div className="relative h-full w-full overflow-hidden bg-black lg:h-[85vh] lg:w-auto lg:aspect-[9/16] lg:rounded-xl lg:shadow-xl">
          <video
            ref={videoRef}
            src={item.videoUrl}
            preload="metadata"
            playsInline
            loop
            muted={isMuted}
            className="h-full w-full object-cover"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

          <Link
            to="/"
            aria-label="Quay về cộng đồng"
            className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50 lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

<Link
            to="/videos/create"
            aria-label="Đăng video"
            className="absolute right-16 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50 lg:hidden"
          >
            <Plus className="h-5 w-5" />
          </Link>

          <button
            type="button"
            aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            onClick={toggleMuted}
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50"
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>

          {heartBurst > 0 && (
            <Heart
              key={heartBurst}
              className="video-heart-burst pointer-events-none absolute left-1/2 top-1/2 z-30 h-24 w-24 -translate-x-1/2 -translate-y-1/2 fill-white text-white drop-shadow-xl"
            />
          )}

          <div className="absolute bottom-0 left-0 z-20 w-[calc(100%-4.5rem)] space-y-2 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-white lg:w-full lg:px-5 lg:pb-5">
            <Link
              to={author._id ? `/profile/${author._id}` : "/videos"}
              className="inline-block text-sm font-bold hover:underline"
            >
              @{author.name || "OpenHeart"}
            </Link>

            <div className="text-sm leading-5 text-white/95">
              <p className={captionExpanded ? "" : "line-clamp-2"}>
                {item.caption}
              </p>
              {item.caption?.length > 90 && (
                <button
                  type="button"
                  onClick={() => setCaptionExpanded((current) => !current)}
                  className="mt-0.5 font-semibold text-white"
                >
                  {captionExpanded ? "Thu gọn" : "Xem thêm"}
                </button>
              )}
            </div>

            {campaign?._id && (
              <div className="flex max-w-full items-center gap-2">
                <Link
                  to={`/campaigns/${campaign._id}`}
                  className="min-w-0 truncate rounded-md bg-white/15 px-2.5 py-1.5 text-xs font-medium backdrop-blur-sm"
                >
                  {campaign.title}
                </Link>
                <Link
                  to={`/campaigns/${campaign._id}`}
                  className="shrink-0 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-400"
                >
                  Ủng hộ
                </Link>
              </div>
            )}
          </div>

          <div className="absolute bottom-6 right-3 z-20 flex flex-col items-center gap-4 lg:hidden">
            <Link
              to={author._id ? `/profile/${author._id}` : "/videos"}
              aria-label={`Xem hồ sơ ${author.name || "chủ dự án"}`}
            >
              <Avatar className="h-11 w-11 border-2 border-white shadow-md">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback className="bg-emerald-600 font-bold text-white">
                  {author.name?.charAt(0)?.toUpperCase() || "O"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <InteractionButton
              mobile
              label="Thả tim"
              icon={Heart}
              active={liked}
              count={likeCount}
              onClick={() => updateLike(!liked)}
            />
            <InteractionButton
              mobile
              label="Bình luận"
              icon={MessageCircle}
              count={commentCount}
              onClick={() => onComment?.(item)}
            />
            {canManage && (
              <Link
                to={`/videos/${item._id}/edit`}
                aria-label="Quản lý video"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm"
              >
                <Settings className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>

        <div className="hidden flex-col items-center gap-5 lg:flex">
          <InteractionButton
            label="Thả tim"
            icon={Heart}
            active={liked}
            count={likeCount}
            onClick={() => updateLike(!liked)}
          />
          <InteractionButton
            label="Bình luận"
            icon={MessageCircle}
            count={commentCount}
            onClick={() => onComment?.(item)}
          />
          {canManage && (
            <Link
              to={`/videos/${item._id}/edit`}
              aria-label="Quản lý video"
              title="Quản lý video"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-white text-slate-700 shadow-sm transition hover:bg-emerald-50"
            >
              <Settings className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
