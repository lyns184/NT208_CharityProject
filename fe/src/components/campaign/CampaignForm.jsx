import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ImageUpload from "@/components/shared/ImageUpload"
import { CAMPAIGN_STATUS } from "@/constants/enums"
import { formatVND } from "@/lib/utils"
import { Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export default function CampaignForm({ initialData, onSubmit, isLoading }) {
  const isEditing = !!initialData
  const isActiveEditing = isEditing && initialData.status === CAMPAIGN_STATUS.ACTIVE
  const isRejectedEditing = isEditing && initialData.status === CAMPAIGN_STATUS.REJECTED

  const [form, setForm] = useState({
    title: "",
    description: "",
    goalAmount: "",
    endDate: "",
    image: null,
  })

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        goalAmount: initialData.goalAmount || "",
        endDate: initialData.endDate
          ? new Date(initialData.endDate).toISOString().split("T")[0]
          : "",
        image: initialData.image || null,
      })
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (result) => {
    setForm((prev) => ({ ...prev, image: result }))
  }

  const validate = () => {
    if (!form.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề chiến dịch")
      return false
    }
    if (form.title.trim().length > 200) {
      toast.error("Tiêu đề không được vượt quá 200 ký tự")
      return false
    }
    if (!form.description.trim()) {
      toast.error("Vui lòng nhập mô tả chiến dịch")
      return false
    }
    const goalNum = Number(form.goalAmount)
    if (!form.goalAmount || isNaN(goalNum) || goalNum < 100000) {
      toast.error("Mục tiêu tối thiểu là 100.000 VNĐ")
      return false
    }
    if (!form.endDate) {
      toast.error("Vui lòng chọn ngày kết thúc")
      return false
    }
    const end = new Date(form.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (end <= today) {
      toast.error("Ngày kết thúc phải ở trong tương lai")
      return false
    }
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      goalAmount: Number(form.goalAmount),
      endDate: form.endDate,
    }

    if (form.image) {
      payload.image = form.image
    }

    onSubmit?.(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {(isActiveEditing || isRejectedEditing) && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-100 [&>svg]:text-amber-600">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {isRejectedEditing
              ? `Chiến dịch này đã bị từ chối${initialData.rejectionReason ? `: ${initialData.rejectionReason}` : ''}. Cập nhật xong sẽ được nộp lại để chờ duyệt.`
              : 'Cập nhật chiến dịch đang hoạt động sẽ chuyển trạng thái về Chờ duyệt.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Title */}
      <div className="space-y-3">
        <Label htmlFor="title" className="text-sm font-semibold text-slate-900">
          Tiêu đề chiến dịch
        </Label>
        <Input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Ví dụ: Nước sạch cho vùng cao"
          maxLength={200}
          className="rounded-lg border border-slate-200 bg-white text-base shadow-sm focus-visible:ring-emerald-500"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {form.title.length}/200 ký tự
          </p>
          {form.title.length > 180 && (
            <p className="text-xs text-amber-600">Tiêu đề sắp hết độ dài cho phép</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-3">
        <Label htmlFor="description" className="text-sm font-semibold text-slate-900">
          Mô tả chi tiết chiến dịch
        </Label>
        <Textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Kể về câu chuyện, mục đích, bối cảnh, kế hoạch thực hiện và kỳ vọng của bạn..."
          rows={7}
          className="rounded-lg border border-slate-200 bg-white text-base shadow-sm focus-visible:ring-emerald-500"
        />
        <p className="text-xs text-muted-foreground">Mô tả chi tiết giúp bạn nhận được nhiều ủng hộ hơn</p>
      </div>

      {/* Goal Amount & End Date */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor="goalAmount" className="text-sm font-semibold text-slate-900">
            Mục tiêu quyên góp (VNĐ)
          </Label>
          <Input
            id="goalAmount"
            name="goalAmount"
            type="number"
            value={form.goalAmount}
            onChange={handleChange}
            placeholder="0"
            min={100000}
            className="rounded-lg border border-slate-200 bg-white text-base shadow-sm focus-visible:ring-emerald-500"
          />
          {form.goalAmount && !isNaN(Number(form.goalAmount)) && (
            <p className="text-sm font-semibold text-emerald-600">
              {formatVND(Number(form.goalAmount))}
            </p>
          )}
          <p className="text-xs text-muted-foreground">Tối thiểu 100.000 VNĐ</p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="endDate" className="text-sm font-semibold text-slate-900">
            Ngày kết thúc chiến dịch
          </Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
            className="rounded-lg border border-slate-200 bg-white text-base shadow-sm focus-visible:ring-emerald-500"
          />
          <p className="text-xs text-muted-foreground">Phải ở trong tương lai</p>
        </div>
      </div>

      {/* Image */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-900">Ảnh bìa chiến dịch</Label>
        <ImageUpload
          label=""
          preview={form.image || null}
          onUpload={handleImageUpload}
        />
        <p className="text-xs text-muted-foreground">Ảnh bìa chất lượng cao giúp chiến dịch thu hút hơn (Tối đa 5MB)</p>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-full bg-emerald-600 py-6 text-base font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 hover:shadow-emerald-300"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang xử lý...
          </>
        ) : isEditing ? (
          isRejectedEditing ? "Cập nhật và nộp lại duyệt" : "Cập nhật chiến dịch"
        ) : (
          "Tạo chiến dịch ngay"
        )}
      </Button>
    </form>
  )
}
