import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createPayment } from "@/api/payment.api"
import { useAuth } from "@/hooks/useAuth"
import { formatVND } from "@/lib/utils"
import { Heart, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Link } from "react-router-dom"

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000]

export default function DonateForm({ campaignId, onPaymentCreated }) {
  const { isAuthenticated } = useAuth()
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePresetClick = (preset) => {
    setAmount(preset)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const numAmount = Number(amount)
    if (!numAmount || numAmount < 10000) {
      toast.error("Số tiền đóng góp tối thiểu là 10.000 VNĐ")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await createPayment({
        campaignId,
        amount: numAmount,
        message: message.trim() || undefined,
        isAnonymous,
      })
      const payload = res.data?.data || res.data
      onPaymentCreated?.(payload?.payment)
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Không thể tạo thanh toán. Vui lòng thử lại."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-3">
          <Heart className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">
            Vui lòng{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              đăng nhập
            </Link>{" "}
            để đóng góp cho chiến dịch này.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-emerald-200">
      <CardHeader className="bg-linear-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200">
        <CardTitle className="flex items-center gap-2 text-emerald-700">
          <Heart className="h-5 w-5 text-emerald-600 fill-emerald-600" />
          Đóng góp
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Preset amounts */}
          <div className="space-y-2">
            <Label className="text-emerald-700 font-semibold">Chọn số tiền</Label>
            <div className="grid grid-cols-2 gap-3">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset ? "default" : "outline"}
                  className={`w-full font-semibold transition ${
                    amount === preset
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600"
                      : "border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400"
                  }`}
                  onClick={() => handlePresetClick(preset)}
                >
                  {formatVND(preset)}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div className="space-y-2">
            <Label htmlFor="custom-amount" className="text-emerald-700 font-semibold">
              Hoặc nhập số tiền khác
            </Label>
            <Input
              id="custom-amount"
              type="number"
              min={10000}
              placeholder="Nhập số tiền (VNĐ)"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
              className="border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="donation-message" className="text-emerald-700 font-semibold">
              Lời nhắn (tuỳ chọn)
            </Label>
            <Textarea
              id="donation-message"
              placeholder="Gửi lời nhắn đến chiến dịch..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          {/* Anonymous switch */}
          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <Label htmlFor="anonymous-switch" className="cursor-pointer text-emerald-700 font-medium">
              Đóng góp ẩn danh
            </Label>
            <Switch
              id="anonymous-switch"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-emerald-600 text-white font-semibold py-3 hover:bg-emerald-700 transition"
            disabled={isSubmitting || !amount}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2 fill-current" />
                Đóng góp ngay
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
