import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createSocialPost } from "@/api/social.api"
import { getMyCampaigns } from "@/api/user.api"
import { uploadApi } from "@/api/upload.api"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { Loader2, Sparkles, UploadCloud, X } from "lucide-react"

const TAG_OPTIONS = [
  { value: "ACTIVITY", label: "Hoạt động" },
  { value: "GIVE", label: "Tặng đồ" },
  { value: "HELP", label: "Cần hỗ trợ" },
]

export default function SocialComposer({
  initialTag = "ACTIVITY",
  initialCampaignId = "",
  onSuccess,
}) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [content, setContent] = useState("")
  const [tag, setTag] = useState(initialTag)
  const [campaignId, setCampaignId] = useState(initialCampaignId)
  const [campaigns, setCampaigns] = useState([])
  const [mediaFiles, setMediaFiles] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false)

  useEffect(() => {
    setTag(initialTag)
  }, [initialTag])

  useEffect(() => {
    setCampaignId(initialCampaignId)
  }, [initialCampaignId])

  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false
    const loadCampaigns = async () => {
      setIsLoadingCampaigns(true)
      try {
        const res = await getMyCampaigns()
        const payload = res.data?.data || res.data
        const list = Array.isArray(payload) ? payload : payload?.campaigns || []
        if (!cancelled) setCampaigns(list)
      } catch {
        if (!cancelled) setCampaigns([])
      } finally {
        if (!cancelled) setIsLoadingCampaigns(false)
      }
    }

    loadCampaigns()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const selectedFiles = useMemo(() => Array.from(mediaFiles || []), [mediaFiles])

  const handleFileChange = (event) => {
    setMediaFiles(event.target.files ? Array.from(event.target.files) : [])
  }

  const removeFile = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung bài viết")
      return
    }

    setIsSubmitting(true)
    try {
      const uploadedMedia = []
      for (const file of selectedFiles) {
        const uploadResult = await uploadApi.uploadFile(file)
        const payload = uploadResult.data?.data || uploadResult.data
        uploadedMedia.push({
          type: file.type.startsWith("video/") ? "video" : "image",
          url: payload?.url,
          etag: payload?.etag || "",
        })
      }

      const res = await createSocialPost({
        content: content.trim(),
        tag,
        campaignId: campaignId || null,
        media: uploadedMedia,
      })

      const post = res.data?.data || res.data
      toast.success("Tạo bài viết thành công")
      setContent("")
      setMediaFiles([])
      onSuccess?.(post)
      if (!onSuccess) {
        navigate(`/social/${post?._id}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể tạo bài viết")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-lg shadow-emerald-100">
      <CardHeader className="border-b border-emerald-100 bg-linear-to-r from-emerald-50 via-white to-emerald-50/50 px-6 py-6 sm:px-8">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
            <Sparkles className="h-5 w-5 text-emerald-600" />
          </div>
          Viết bài mới
        </CardTitle>
        <p className="mt-1 text-sm text-slate-600">Chia sẻ câu chuyện tử tế và cảm xúc của bạn với cộng đồng</p>
      </CardHeader>
      <CardContent className="space-y-6 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-900">Nội dung bài viết</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Hãy chia sẻ những điều tốt đẹp trong cuộc sống hoặc những hoàn cảnh cần giúp đỡ..."
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-sm focus-visible:ring-emerald-500"
            />
            <p className="text-xs text-muted-foreground">Bài viết sẽ được hiển thị trên trang Mạng xã hội</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-900">Phân loại bài viết</Label>
              <Select value={tag} onValueChange={setTag}>
                <SelectTrigger className="rounded-2xl border border-slate-200 bg-white text-base shadow-sm focus:ring-emerald-500">
                  <SelectValue placeholder="Chọn phân loại" />
                </SelectTrigger>
                <SelectContent>
                  {TAG_OPTIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-900">Liên kết chiến dịch</Label>
              <Select value={campaignId || "none"} onValueChange={(value) => setCampaignId(value === "none" ? "" : value)}>
                <SelectTrigger className="rounded-2xl border border-slate-200 bg-white text-base shadow-sm focus:ring-emerald-500">
                  <SelectValue placeholder="Chọn chiến dịch (tùy chọn)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không liên kết chiến dịch</SelectItem>
                  {isLoadingCampaigns ? (
                    <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                  ) : (
                    campaigns.map((campaign) => {
                      const id = campaign._id || campaign.id
                      return (
                        <SelectItem key={id} value={id}>
                          {campaign.title}
                        </SelectItem>
                      )
                    })
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-900">Hình ảnh / Video</Label>
            <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-50/50 p-6 transition-colors hover:border-emerald-400">
              <Input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
                className="rounded-xl bg-white text-sm"
              />
              <p className="mt-2 text-xs text-slate-600">Tải lên hình ảnh hoặc video (Tối đa 10 tệp)</p>

              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-700">Tệp đã chọn:</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {selectedFiles.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-slate-200">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-slate-900">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{Math.round(file.size / 1024)} KB</p>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)} className="ml-2 flex-shrink-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-6">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="rounded-full px-6">
              Hủy
            </Button>
            <Button
              type="submit"
              className="rounded-full bg-emerald-600 px-8 font-semibold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đăng...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Đăng bài ngay
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}