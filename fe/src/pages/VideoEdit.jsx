import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { getCampaigns } from "@/api/campaign.api"
import { deleteVideo, getVideo, updateVideo } from "@/api/video.api"
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

export default function VideoEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [video, setVideo] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [caption, setCaption] = useState("")
  const [campaignId, setCampaignId] = useState("none")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      getVideo(id),
      getCampaigns({ status: "ACTIVE,GOAL_REACHED,CLOSED" }),
    ])
      .then(([videoResponse, campaignsResponse]) => {
        if (cancelled) return
        const videoPayload = videoResponse.data?.data || videoResponse.data
        const item = videoPayload?.video || videoPayload
        const campaignsPayload =
          campaignsResponse.data?.data || campaignsResponse.data
        const list = campaignsPayload?.campaigns ?? campaignsPayload ?? []

        setVideo(item)
        setCaption(item?.caption || "")
        setCampaignId(item?.campaignId?._id || "none")
        setCampaigns(Array.isArray(list) ? list : [])
      })
      .catch(() => {
        if (!cancelled) toast.error("Không thể tải video")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const canManage =
    isAdmin ||
    (video?.authorId?._id &&
      user?._id &&
      video.authorId._id.toString() === user._id.toString())

  const save = async (event) => {
    event.preventDefault()
    if (!caption.trim()) return
    setSaving(true)
    try {
      await updateVideo(id, {
        caption: caption.trim(),
        campaignId: campaignId === "none" ? null : campaignId,
      })
      toast.success("Đã cập nhật video")
      navigate("/videos")
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể cập nhật video")
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!window.confirm("Bạn chắc chắn muốn xóa video này?")) return
    setDeleting(true)
    try {
      await deleteVideo(id)
      toast.success("Đã xóa video")
      navigate("/videos")
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa video")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!video || !canManage) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">Không có quyền truy cập</h1>
        <Button asChild className="mt-5">
          <Link to="/videos">Quay lại Video Feed</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Button asChild variant="ghost" className="mb-5 -ml-2">
        <Link to="/videos">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại Video Feed
        </Link>
      </Button>

      <Card className="border-emerald-100">
        <CardContent className="grid gap-6 p-5 sm:p-7 md:grid-cols-[220px_1fr]">
          <video
            src={video.videoUrl}
            poster={video.thumbnailUrl}
            controls
            preload="metadata"
            className="aspect-[9/16] w-full rounded-lg bg-black object-cover"
          />

          <form onSubmit={save} className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Chỉnh sửa video</h1>
              <p className="mt-1 text-sm text-slate-500">
                Cập nhật caption hoặc chiến dịch được liên kết.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-caption">Caption</Label>
              <Textarea
                id="edit-caption"
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                maxLength={2000}
                rows={7}
              />
            </div>

            <div className="space-y-2">
              <Label>Chiến dịch liên kết</Label>
              <Select value={campaignId} onValueChange={setCampaignId}>
                <SelectTrigger>
                  <SelectValue />
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

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                disabled={saving || !caption.trim()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu thay đổi
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deleting}
                onClick={remove}
              >
                {deleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Xóa video
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
