import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  CheckCircle2,
  Film,
  Loader2,
  Upload,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { getCampaigns } from "@/api/campaign.api"
import { uploadApi } from "@/api/upload.api"
import { createVideo } from "@/api/video.api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const MAX_SIZE = 100 * 1024 * 1024
const MAX_DURATION = 180
const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"]

function loadVideoMetadata(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement("video")
    video.preload = "metadata"
    video.muted = true
    video.playsInline = true
    video.src = url

    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        url,
        video,
      })
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Không thể đọc video"))
    }
  })
}

function captureFirstFrame(metadata) {
  return new Promise((resolve, reject) => {
    const { video, url, width, height, duration } = metadata
    const capture = () => {
      const canvas = document.createElement("canvas")
      canvas.width = Math.max(width, 1)
      canvas.height = Math.max(height, 1)
      const context = canvas.getContext("2d")
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (!blob) {
            reject(new Error("Không thể tạo ảnh bìa"))
            return
          }
          resolve(
            new File([blob], `video-thumbnail-${Date.now()}.jpg`, {
              type: "image/jpeg",
            })
          )
        },
        "image/jpeg",
        0.86
      )
    }

    video.onseeked = capture
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Không thể tạo ảnh bìa"))
    }
    video.currentTime = Math.min(0.1, Math.max(duration / 20, 0))
    if (video.readyState >= 2 && video.currentTime === 0) capture()
  })
}

export default function VideoCreate() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState("")
  const [duration, setDuration] = useState(0)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState("")
  const [caption, setCaption] = useState("")
  const [campaignId, setCampaignId] = useState("none")
  const [campaigns, setCampaigns] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [phase, setPhase] = useState("")

  const isVerified = Boolean(user?.isVerified)
  const canSubmit =
    isVerified &&
    file &&
    thumbnailFile &&
    caption.trim() &&
    duration > 0 &&
    duration <= MAX_DURATION

  useEffect(() => {
    let cancelled = false
    getCampaigns({ status: "ACTIVE,GOAL_REACHED,CLOSED" })
      .then((response) => {
        const payload = response.data?.data || response.data
        const list = payload?.campaigns ?? payload ?? []
        if (!cancelled) setCampaigns(Array.isArray(list) ? list : [])
      })
      .catch(() => {
        if (!cancelled) setCampaigns([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
    },
    [preview, thumbnailPreview]
  )

  const durationLabel = useMemo(() => {
    const totalSeconds = Math.round(duration || 0)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${String(seconds).padStart(2, "0")}`
  }, [duration])

  const clearVideo = () => {
    if (preview) URL.revokeObjectURL(preview)
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
    setFile(null)
    setPreview("")
    setDuration(0)
    setThumbnailFile(null)
    setThumbnailPreview("")
  }

  const selectVideo = async (selectedFile) => {
    if (!selectedFile) return
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      toast.error("Chỉ hỗ trợ MP4, WebM hoặc MOV")
      return
    }
    if (selectedFile.size > MAX_SIZE) {
      toast.error("Video không được vượt quá 100MB")
      return
    }

    try {
      setPhase("Đang xử lý video...")
      const metadata = await loadVideoMetadata(selectedFile)
      if (!Number.isFinite(metadata.duration) || metadata.duration <= 0) {
        URL.revokeObjectURL(metadata.url)
        throw new Error("Không đọc được thời lượng video")
      }
      if (metadata.duration > MAX_DURATION) {
        URL.revokeObjectURL(metadata.url)
        toast.error("Video không được dài quá 3 phút")
        return
      }

      const thumbnail = await captureFirstFrame(metadata)
      clearVideo()
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
      setDuration(metadata.duration)
      setThumbnailFile(thumbnail)
      setThumbnailPreview(URL.createObjectURL(thumbnail))
    } catch (error) {
      toast.error(error.message || "Không thể xử lý video")
    } finally {
      setPhase("")
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!canSubmit) return

    setSubmitting(true)
    try {
      setPhase("Đang tải video lên...")
      const videoResponse = await uploadApi.uploadFile(file)
      const videoPayload = videoResponse.data?.data || videoResponse.data

      setPhase("Đang tạo ảnh bìa...")
      const thumbnailResponse = await uploadApi.uploadFile(thumbnailFile)
      const thumbnailPayload =
        thumbnailResponse.data?.data || thumbnailResponse.data

      setPhase("Đang đăng video...")
      await createVideo({
        videoUrl: videoPayload?.url,
        thumbnailUrl: thumbnailPayload?.url,
        duration,
        caption: caption.trim(),
        campaignId: campaignId === "none" ? null : campaignId,
      })

      toast.success("Đăng video thành công")
      navigate("/videos")
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể đăng video")
    } finally {
      setSubmitting(false)
      setPhase("")
    }
  }

  if (!isVerified) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12">
        <Card className="w-full border-amber-200">
          <CardContent className="p-8 text-center">
            <Film className="mx-auto h-11 w-11 text-amber-500" />
            <h1 className="mt-4 text-xl font-bold text-slate-900">
              Cần xác minh KYC
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Bạn cần hoàn tất xác minh danh tính trước khi đăng video.
            </p>
            <Button asChild className="mt-6 bg-emerald-600 hover:bg-emerald-700">
              <Link to="/profile">Đi đến hồ sơ</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <Button asChild variant="ghost" className="mb-5 -ml-2">
        <Link to="/videos">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại Video Feed
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form onSubmit={submit} className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Đăng video mới</h1>
            <p className="mt-2 text-sm text-slate-600">
              Chia sẻ hành trình thiện nguyện bằng video dọc hoặc ngang.
            </p>
          </div>

          <Card className="border-emerald-100">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="space-y-2">
                <Label>Video</Label>
                {preview ? (
                  <div className="relative overflow-hidden rounded-xl bg-black">
                    <video
                      src={preview}
                      controls
                      preload="metadata"
                      className="max-h-[520px] w-full object-contain"
                    />
                    <button
                      type="button"
                      aria-label="Xóa video"
                      onClick={clearVideo}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
                      {durationLabel}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex min-h-64 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 px-5 text-center transition hover:border-emerald-400"
                  >
                    {phase ? (
                      <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                    ) : (
                      <Upload className="h-10 w-10 text-emerald-600" />
                    )}
                    <p className="mt-4 font-semibold text-emerald-900">
                      Chọn video để tải lên
                    </p>
                    <p className="mt-1 text-xs text-emerald-700">
                      MP4, WebM, MOV • tối đa 100MB • tối đa 3 phút
                    </p>
                  </button>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  onChange={(event) => {
                    selectVideo(event.target.files?.[0])
                    event.target.value = ""
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="video-caption">Caption</Label>
                <Textarea
                  id="video-caption"
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  maxLength={2000}
                  rows={5}
                  placeholder="Kể câu chuyện phía sau video..."
                />
                <p className="text-right text-xs text-slate-400">
                  {caption.length}/2000
                </p>
              </div>

              <div className="space-y-2">
                <Label>Chiến dịch liên kết (không bắt buộc)</Label>
                <Select value={campaignId} onValueChange={setCampaignId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chiến dịch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không liên kết chiến dịch</SelectItem>
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign._id} value={campaign._id}>
                        {campaign.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={!canSubmit || submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {phase || "Đang đăng..."}
                  </>
                ) : (
                  "Đăng video"
                )}
              </Button>
            </CardContent>
          </Card>
        </form>

        <aside className="space-y-4">
          <Card className="border-emerald-100">
            <CardContent className="p-5">
              <h2 className="font-semibold text-slate-900">Ảnh bìa tự động</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Hệ thống sử dụng frame đầu tiên của video.
              </p>
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt="Ảnh bìa video"
                  className="mt-4 aspect-[9/16] max-h-80 w-full rounded-lg bg-slate-100 object-cover"
                />
              ) : (
                <div className="mt-4 flex aspect-[9/16] max-h-80 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                  <Film className="h-9 w-9" />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50 p-5 text-sm text-emerald-900">
            {[
              "Video hiển thị ngay sau khi đăng",
              "Bạn có thể sửa caption hoặc xóa video",
              "Lượt xem được tính sau 3 giây",
            ].map((text) => (
              <div key={text} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
