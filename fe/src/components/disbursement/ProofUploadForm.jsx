import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ImagePlus, X, Upload } from "lucide-react"
import { toast } from "sonner"
import { uploadProof, getDisbursement } from "@/api/disbursement.api"
import ImageUpload from "@/components/shared/ImageUpload"

const MAX_IMAGES = 5

export default function ProofUploadForm({ disbursementId, onSuccess }) {
  const [images, setImages] = useState([]) // array of { url, etag }
  const [caption, setCaption] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(true)

  const addSlot = () => {
    if (images.length >= MAX_IMAGES) {
      toast.error(`Tối đa ${MAX_IMAGES} ảnh minh chứng`)
      return
    }
    setImages((prev) => [...prev, null]) // null = empty slot
  }

  const removeSlot = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = (index, result) => {
    setImages((prev) => {
      const next = [...prev]
      next[index] = result // { url, etag } or null if removed
      return next
    })
  }

  const uploadedImages = images.filter(Boolean)

  // Load existing disbursement images and caption
  useEffect(() => {
    let cancelled = false
    const fetch = async () => {
      setLoadingInitial(true)
      try {
        const res = await getDisbursement(disbursementId)
        const payload = res.data?.data || res.data
        if (!cancelled && payload) {
          const existing = payload.proofImages ?? []
          const normalized = existing.map((i) => (typeof i === 'string' ? { url: i } : i))
          setImages(normalized)
          setCaption(payload.proofCaption || '')
        }
      } catch (err) {
        // ignore
      } finally {
        if (!cancelled) setLoadingInitial(false)
      }
    }
    if (disbursementId) fetch()
    return () => {
      cancelled = true
    }
  }, [disbursementId])

  const handleSubmit = async () => {
    if (uploadedImages.length === 0) {
      toast.error("Vui lòng tải lên ít nhất 1 ảnh minh chứng")
      return
    }

    if (!caption.trim()) {
      toast.error("Vui lòng nhập mô tả chi tiêu")
      return
    }

    setSubmitting(true)
    try {
      const normalizedImages = uploadedImages.map((img) =>
        typeof img === 'string' ? img : img?.url || null
      ).filter(Boolean)
      const normalizedEtags = uploadedImages.map((img) =>
        typeof img === 'object' && img?.etag ? img.etag : null
      ).filter(Boolean)

      const res = await uploadProof(disbursementId, {
        proofImages: normalizedImages,
        proofETags: normalizedEtags,
        proofCaption: caption.trim(),
      })

      // update local state from response (server returns updated disbursement)
      const updated = res.data?.data || res.data
      const existing = updated.proofImages ?? []
      setImages(existing.map((i) => (typeof i === 'string' ? { url: i } : i)))
      setCaption(updated.proofCaption || '')
      toast.success("Lưu minh chứng thành công!")
      onSuccess?.(updated)
    } catch (err) {
      const msg =
        err.response?.data?.message || "Tải lên minh chứng thất bại"
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-3xl border-emerald-100 shadow-sm">
      <CardHeader className="rounded-t-4xl bg-linear-to-r from-emerald-50 to-white">
        <CardTitle className="flex items-center gap-2 text-lg text-emerald-800">
          <Upload className="h-5 w-5 text-emerald-600" />
          Tải lên minh chứng sử dụng quỹ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <p className="text-sm text-emerald-700">
          Tải lên ảnh minh chứng chi tiêu (hoá đơn, biên lai, ảnh chụp...).
          Tối đa {MAX_IMAGES} ảnh. Ảnh đã lưu sẽ hiển thị ở đây.
        </p>

        {/* Caption field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-emerald-800">Mô tả chi tiêu *</label>
          <Textarea
            placeholder="Mô tả chi tiết về chi tiêu này (ví dụ: Mua vật tư y tế, trị giáo dục, v.v.)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="resize-none border-emerald-200 focus-visible:border-emerald-400 focus-visible:ring-emerald-200"
          />
        </div>

        {/* Image slots */}
        <div className="space-y-3">
          {loadingInitial ? (
            <div className="text-sm text-emerald-700">Đang tải minh chứng...</div>
          ) : (
            images.map((img, index) => (
              <div key={index} className="relative">
                <ImageUpload
                  preview={typeof img === 'string' ? img : img?.url || null}
                  label={`Ảnh minh chứng ${index + 1}`}
                  returnPayload={true}
                  onUpload={(result) => handleUpload(index, result)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-7 w-7 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                  onClick={() => removeSlot(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Add slot button */}
        {images.length < MAX_IMAGES && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSlot}
            className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            Thêm ảnh ({images.length}/{MAX_IMAGES})
          </Button>
        )}

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
          disabled={submitting || uploadedImages.length === 0 || !caption.trim()}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang gửi...
            </>
          ) : (
            `Gửi minh chứng (${uploadedImages.length} ảnh)`
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
