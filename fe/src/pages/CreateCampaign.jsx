import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import CampaignForm from "@/components/campaign/CampaignForm"
import KYCStatusBanner from "@/components/kyc/KYCStatusBanner"
import KYCLayoutWithTips from "@/components/kyc/KYCLayoutWithTips"
import { createCampaign } from "@/api/campaign.api"
import { submitKYC } from "@/api/user.api"
import { KYC_STATUS, USER_ROLE } from "@/constants/enums"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldAlert } from "lucide-react"
import { toast } from "sonner"

export default function CreateCampaign() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [kycLoading, setKycLoading] = useState(false)
  const [campaignLoading, setCampaignLoading] = useState(false)

  const kycStatus = user?.kycStatus || KYC_STATUS.NONE

  const handleKYCSubmit = async (formData) => {
    setKycLoading(true)
    try {
      // formData = { idCardFront: "url", idCardBack: "url", portrait: "url" }
      await submitKYC(formData)
      toast.success("Gửi yêu cầu xác minh thành công! Vui lòng chờ duyệt.")
      await refreshProfile()
    } catch (err) {
      const msg =
        err.response?.data?.message || "Gửi yêu cầu xác minh thất bại"
      toast.error(msg)
    } finally {
      setKycLoading(false)
    }
  }

  const handleCampaignSubmit = async (data) => {
    setCampaignLoading(true)
    try {
      await createCampaign(data)
      toast.success("Tạo chiến dịch thành công! Chiến dịch đang chờ duyệt.")
      navigate("/my-campaigns")
    } catch (err) {
      const msg =
        err.response?.data?.message || "Tạo chiến dịch thất bại"
      toast.error(msg)
    } finally {
      setCampaignLoading(false)
    }
  }

  // Admin cannot create campaigns
  if (user?.role === USER_ROLE.ADMIN) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Alert className="border-yellow-500/50 bg-yellow-50 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200 [&>svg]:text-yellow-600">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            Tài khoản quản trị viên không thể tạo chiến dịch gây quỹ.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Bắt đầu hành trình nhân ái</h1>
          <p className="mt-3 text-lg text-slate-600">
            Chia sẻ câu chuyện của bạn và kêu gọi cộng đồng cùng chung tay kiến tạo những thay đổi tích cực thông qua nền tảng minh bạch OpenHeart.
          </p>
        </div>

      {/* KYC Gate */}
      {kycStatus !== KYC_STATUS.APPROVED ? (
        <div className="space-y-6">
          <KYCStatusBanner status={kycStatus} />

          {(kycStatus === KYC_STATUS.NONE ||
            kycStatus === KYC_STATUS.REJECTED) && (
            <div className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-lg shadow-emerald-100">
              <KYCLayoutWithTips
                accountType={user?.accountType}
                onSubmit={handleKYCSubmit}
                isLoading={kycLoading}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-2xl border border-emerald-200 bg-white shadow-lg shadow-emerald-100">
            <CardContent className="p-8">
              <CampaignForm
                onSubmit={handleCampaignSubmit}
                isLoading={campaignLoading}
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="rounded-2xl border border-slate-200 bg-white shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <span className="text-emerald-600">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Mẹo tạo chiến dịch hiệu quả</p>
                    <p className="mt-2 text-sm text-slate-600">
                      Tiêu đề hấp dẫn, mô tả chi tiết và hình ảnh chất lượng cao có thể tăng tỷ lệ thành công lên đến 75%.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-50/50 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-200">
                    <span className="text-emerald-700">🔒</span>
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900">Minh bạch là nền tảng</p>
                    <p className="mt-2 text-sm text-emerald-800/90">
                      Chia sẻ đầy đủ thông tin về mục tiêu, kế hoạch thực hiện và cách sử dụng quỹ để tăng niềm tin cộng đồng.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
