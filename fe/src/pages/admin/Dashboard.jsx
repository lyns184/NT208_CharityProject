import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { getKYCList, getAdminStats } from "@/api/admin.api"
import { getCampaigns } from "@/api/campaign.api"
import AdminStatsCards from "@/components/admin/AdminStatsCards"
import KYCReviewCard from "@/components/admin/KYCReviewCard"
import CampaignApprovalCard from "@/components/admin/CampaignApprovalCard"
import { approveKYC, approveCampaign } from "@/api/admin.api"
import { CardSkeleton } from "@/components/shared/LoadingSkeleton"
import EmptyState from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { ArrowRight, LayoutDashboard, Inbox } from "lucide-react"
import { KYC_STATUS, CAMPAIGN_STATUS } from "@/constants/enums"
import { toast } from "sonner"

export default function Dashboard() {
  const [kycList, setKycList] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true)
    try {
      const [kycRes, campaignRes, statsRes] = await Promise.all([
        getKYCList(),
        getCampaigns({ status: CAMPAIGN_STATUS.PENDING, limit: 50 }),
        getAdminStats(),
      ])
      const kycPayload = kycRes.data?.data || kycRes.data
      const campaignPayload = campaignRes.data?.data || campaignRes.data
      const statsPayload = statsRes.data?.data || statsRes.data
      setKycList(kycPayload?.users ?? kycPayload ?? [])
      setCampaigns(campaignPayload?.campaigns ?? campaignPayload ?? [])
      setStats(statsPayload || null)
    } catch {
      toast.error("Không thể tải dữ liệu Dashboard")
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const intervalId = setInterval(() => fetchData(true), 15000)

    const handleFocus = () => fetchData(true)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchData(true)
      }
    }

    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [fetchData])

  // Compute stats
  const pendingKYC = kycList.filter(
    (k) => (k.kycStatus ?? k.status) === KYC_STATUS.PENDING
  )
  const pendingCampaigns = campaigns.filter(
    (c) => c.status === CAMPAIGN_STATUS.PENDING
  )

  const statsData = {
    totalUsers: stats?.totalUsers ?? 0,
    totalCampaigns: stats?.totalCampaigns ?? 0,
    totalDonations: stats?.totalDonations ?? 0,
    approvedKYC: stats?.approvedKYC ?? 0,
  }

  // --- KYC action handlers ---
  const handleKYCApprove = async (kyc) => {
    const userId = kyc.user?._id ?? kyc._id
    await approveKYC(userId, { status: "APPROVED" })
    toast.success("Đã duyệt KYC thành công")
    fetchData()
  }

  const handleKYCReject = async (kyc, reason) => {
    const userId = kyc.user?._id ?? kyc._id
    await approveKYC(userId, {
      status: "REJECTED",
      rejectionReason: reason,
    })
    toast.success("Đã từ chối KYC")
    fetchData()
  }

  // --- Campaign action handlers ---
  const handleCampaignApprove = async (campaign) => {
    await approveCampaign(campaign._id, { status: "ACTIVE" })
    toast.success("Đã duyệt chiến dịch thành công")
    fetchData()
  }

  const handleCampaignReject = async (campaign, reason) => {
    await approveCampaign(campaign._id, {
      status: "REJECTED",
      rejectionReason: reason,
    })
    toast.success("Đã từ chối chiến dịch")
    fetchData()
  }

  return (
    <div className="relative space-y-8 overflow-hidden rounded-3xl border border-emerald-100/70 bg-linear-to-br from-emerald-50 via-white to-emerald-50 p-5 shadow-sm sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_45%),radial-gradient(circle_at_top_right,rgba(52,211,153,0.14),transparent_35%)]" />

      <div className="relative flex flex-col gap-4 rounded-2xl border border-emerald-100/80 bg-white/85 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner shadow-emerald-200/60">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Theo dõi KYC, chiến dịch và hoạt động giải ngân.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Đang hoạt động
        </div>
      </div>

      <div className="relative">
        <AdminStatsCards data={statsData} />
      </div>

      {isLoading ? (
        <div className="relative rounded-2xl border border-emerald-100 bg-white/85 p-4 shadow-sm backdrop-blur">
          <CardSkeleton count={3} />
        </div>
      ) : (
        <>
          <section className="relative rounded-2xl border border-emerald-100 bg-white/85 p-4 shadow-sm backdrop-blur sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">KYC chờ duyệt</h2>
                <p className="text-sm text-muted-foreground">Kiểm tra hồ sơ xác minh cần xử lý trước.</p>
              </div>
              {pendingKYC.length > 0 && (
                <Button variant="ghost" size="sm" asChild className="text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
                  <Link to="/admin/kyc" className="gap-1">
                    Xem tất cả
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
            {pendingKYC.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="Không có KYC chờ duyệt"
                description="Tất cả yêu cầu KYC đã được xử lý."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingKYC.slice(0, 3).map((kyc) => (
                  <KYCReviewCard
                    key={kyc._id ?? kyc.user?._id}
                    kyc={kyc}
                    onApprove={handleKYCApprove}
                    onReject={handleKYCReject}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="relative rounded-2xl border border-emerald-100 bg-white/85 p-4 shadow-sm backdrop-blur sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Chiến dịch chờ duyệt</h2>
                <p className="text-sm text-muted-foreground">Ưu tiên các chiến dịch đang chờ kiểm duyệt nội dung.</p>
              </div>
              {pendingCampaigns.length > 0 && (
                <Button variant="ghost" size="sm" asChild className="text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
                  <Link to="/admin/campaigns" className="gap-1">
                    Xem tất cả
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
            {pendingCampaigns.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="Không có chiến dịch chờ duyệt"
                description="Tất cả chiến dịch đã được xử lý."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingCampaigns.slice(0, 3).map((campaign) => (
                  <CampaignApprovalCard
                    key={campaign._id}
                    campaign={campaign}
                    onApprove={handleCampaignApprove}
                    onReject={handleCampaignReject}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
