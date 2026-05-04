import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, Banknote } from "lucide-react"
import { toast } from "sonner"
import { formatVND } from "@/lib/utils"
import { requestDisbursement } from "@/api/disbursement.api"
import ImageUpload from "@/components/shared/ImageUpload"

export default function DisbursementRequestForm({
  campaignId,
  availableAmount,
  onSuccess,
}) {
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [requestQrImage, setRequestQrImage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const numericAmount = Number(amount) || 0
  const MIN_AMOUNT = 10000

  const validate = () => {
    if (!amount || numericAmount <= 0) {
      toast.error("Vui lòng nhập số tiền giải ngân")
      return false
    }
    if (numericAmount < MIN_AMOUNT) {
      toast.error(`Số tiền tối thiểu là ${formatVND(MIN_AMOUNT)}`)
      return false
    }
    if (numericAmount > availableAmount) {
      toast.error(
        `Số tiền vượt quá số dư khả dụng (${formatVND(availableAmount)})`
      )
      return false
    }
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do giải ngân")
      return false
    }
    if (!requestQrImage.trim()) {
      toast.error("Vui lòng tải lên QR nhận tiền")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await requestDisbursement({
        campaignId,
        amount: numericAmount,
        reason: reason.trim(),
        requestQrImage: requestQrImage.trim(),
      })
      toast.success("Gửi yêu cầu giải ngân thành công!")
      setAmount("")
      setReason("")
      setRequestQrImage("")
      onSuccess?.()
    } catch (err) {
      const msg =
        err.response?.data?.message || "Gửi yêu cầu giải ngân thất bại"
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="border-emerald-100 shadow-sm">
      <CardHeader className="rounded-t-[20px] bg-linear-to-r from-emerald-50 to-white">
        <CardTitle className="flex items-center gap-2 text-lg text-emerald-800">
          <Banknote className="h-5 w-5 text-emerald-600" />
          Tạo yêu cầu giải ngân
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Available balance */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <p className="text-sm text-emerald-700">Số dư khả dụng</p>
            <p className="text-lg font-semibold text-emerald-700">
              {formatVND(availableAmount)}
            </p>
          </div>

          {/* Amount input */}
          <div className="space-y-2">
            <Label htmlFor="disbursement-amount">
              Số tiền giải ngân (VNĐ) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="disbursement-amount"
              type="number"
              min={MIN_AMOUNT}
              max={availableAmount}
              step={1000}
              placeholder={`Tối thiểu ${formatVND(MIN_AMOUNT)}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={submitting}
              className="border-emerald-200 focus-visible:border-emerald-400 focus-visible:ring-emerald-200"
            />
            {numericAmount > 0 && (
              <p className="text-xs text-emerald-700">
                = {formatVND(numericAmount)}
              </p>
            )}
          </div>

          {/* Reason textarea */}
          <div className="space-y-2">
            <Label htmlFor="disbursement-reason">
              Lý do giải ngân <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="disbursement-reason"
              rows={3}
              placeholder="Mô tả mục đích sử dụng quỹ..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              className="border-emerald-200 focus-visible:border-emerald-400 focus-visible:ring-emerald-200"
            />
          </div>

          {/* Payout QR image */}
          <div className="space-y-2">
            <Label className="text-emerald-800">
              QR nhận tiền <span className="text-red-500">*</span>
            </Label>
            <ImageUpload
              label="Tải ảnh QR nhận tiền"
              preview={requestQrImage}
              onUpload={(url) => setRequestQrImage(url || "")}
            />
            <p className="text-xs text-emerald-700">
              Đây là QR để admin quét và chuyển tiền cho bạn.
            </p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={submitting || availableAmount <= 0 || !requestQrImage}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              "Gửi yêu cầu giải ngân"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
