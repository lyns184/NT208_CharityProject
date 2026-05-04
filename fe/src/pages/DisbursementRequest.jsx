import { useState, useEffect, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import { getCampaignDetail, getCampaignSummary } from "@/api/campaign.api"
import { DISBURSEMENT_STATUS, CAMPAIGN_STATUS } from "@/constants/enums"
import { formatVND } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import ProgressBar from "@/components/shared/ProgressBar"
import StatusBadge from "@/components/shared/StatusBadge"
import EmptyState from "@/components/shared/EmptyState"
import DisbursementTimeline from "@/components/disbursement/DisbursementTimeline"
import DisbursementRequestForm from "@/components/disbursement/DisbursementRequestForm"
import ProofUploadForm from "@/components/disbursement/ProofUploadForm"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Banknote,
  FolderHeart,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Skeleton className="h-8 w-48" />
      <div className="rounded-xl border p-6 space-y-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-2.5 w-full rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border p-6 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="rounded-xl border p-6 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  )
}

export default function DisbursementRequest() {
  const { id } = useParams()
  const { user } = useAuth()

  const [campaign, setCampaign] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [proofOpen, setProofOpen] = useState(false)
  const [selectedProofDisbursement, setSelectedProofDisbursement] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [campaignRes, summaryRes] = await Promise.all([
        getCampaignDetail(id),
        getCampaignSummary(id),
      ])
      const campaignPayload = campaignRes.data?.data || campaignRes.data
      const summaryPayload = summaryRes.data?.data || summaryRes.data

      setCampaign(campaignPayload?.campaign ?? campaignPayload)
      setSummary(summaryPayload)
    } catch (err) {
      const msg =
        err.response?.data?.message || "Không thể tải thông tin chiến dịch"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Loading
  if (loading) return <PageSkeleton />

  // Error
  if (error || !campaign) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <EmptyState
          icon={AlertTriangle}
          title="Không thể tải dữ liệu"
          description={error || "Chiến dịch không tồn tại hoặc bạn không có quyền truy cập."}
          action={
            <Button asChild variant="outline">
              <Link to="/my-campaigns">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  // Campaign data
  const campaignId = campaign._id || campaign.id
  const currentAmount = campaign.currentBalance ?? campaign.currentAmount ?? 0
  const goalAmount = campaign.goalAmount ?? 0
  const disbursements = summary?.disbursements ?? campaign.disbursements ?? []
  const totalDisbursed =
    summary?.totalDisbursed ??
    campaign.disbursedAmount ??
    disbursements
      .filter((d) => d.status !== DISBURSEMENT_STATUS.REJECTED)
      .reduce((sum, d) => sum + (d.amount || 0), 0)
  const availableAmount = Math.max(currentAmount - totalDisbursed, 0)

  // Status checks
  const canRequestDisbursement =
    campaign.status === CAMPAIGN_STATUS.GOAL_REACHED ||
    campaign.status === CAMPAIGN_STATUS.CLOSED ||
    campaign.status === CAMPAIGN_STATUS.ACTIVE

  const imageUrl =
    typeof campaign.image === "string"
      ? campaign.image
      : campaign.image?.url || null

  const openProofModal = (disbursement) => {
    if (!disbursement) return
    const isCompleted = disbursement.status === DISBURSEMENT_STATUS.COMPLETED || disbursement.status === 'PENDING_VERIFY'
    if (!isCompleted) return
    setSelectedProofDisbursement(disbursement)
    setProofOpen(true)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Back link */}
      <Button asChild variant="ghost" className="mb-4 -ml-2 rounded-full text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
        <Link to="/my-campaigns">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Chiến dịch của tôi
        </Link>
      </Button>

      {/* Page title */}
      <div className="mb-6 rounded-[28px] border border-emerald-100 bg-linear-to-r from-emerald-50 to-white px-6 py-5 shadow-sm">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900">
          <Banknote className="h-7 w-7 text-emerald-600" />
          Yêu cầu giải ngân
        </h1>
        <p className="mt-1 text-slate-600">
          Quản lý các yêu cầu giải ngân cho chiến dịch này
        </p>
      </div>

      {/* Campaign summary card */}
      <Card className="mb-6 overflow-hidden border-emerald-100 shadow-sm">
        <CardContent className="p-5">
          <div className="flex gap-4">
            {/* Thumbnail */}
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={campaign.title}
                className="h-20 w-20 shrink-0 rounded-xl border border-emerald-100 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50">
                <FolderHeart className="h-8 w-8 text-emerald-300" />
              </div>
            )}
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-base font-semibold leading-tight line-clamp-2 text-slate-900">
                  {campaign.title}
                </h2>
                <StatusBadge status={campaign.status} type="campaign" />
              </div>
              <ProgressBar current={currentAmount} goal={goalAmount} />
            </div>
          </div>

          {/* Financial summary */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-center ring-1 ring-emerald-100">
              <p className="text-xs text-emerald-700">Tổng nhận</p>
              <p className="text-sm font-semibold text-emerald-800">{formatVND(currentAmount)}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-center ring-1 ring-emerald-100">
              <p className="text-xs text-emerald-700">Đã giải ngân</p>
              <p className="text-sm font-semibold text-emerald-600">
                {formatVND(totalDisbursed)}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-center ring-1 ring-emerald-100">
              <p className="text-xs text-emerald-700">Khả dụng</p>
              <p className="text-sm font-semibold text-emerald-700">
                {formatVND(availableAmount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-900">Yêu cầu giải ngân</h3>
          </div>

          {canRequestDisbursement && availableAmount > 0 ? (
            <DisbursementRequestForm
              campaignId={campaignId}
              availableAmount={availableAmount}
              onSuccess={fetchData}
            />
          ) : (
            <Card>
              <CardContent className="p-5">
                <EmptyState
                  icon={Banknote}
                  title="Không có số dư khả dụng"
                  description="Tất cả số tiền đã được giải ngân hoặc đang chờ xử lý."
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-900">
              Lịch sử giải ngân ({disbursements.length})
            </h3>
          </div>
          {disbursements.length > 0 ? (
            <DisbursementTimeline
              disbursements={disbursements}
              onUploadProof={openProofModal}
            />
          ) : (
            <Card>
              <CardContent className="p-5">
                <EmptyState
                  icon={Banknote}
                  title="Chưa có yêu cầu nào"
                  description="Tạo yêu cầu giải ngân đầu tiên để bắt đầu."
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={proofOpen} onOpenChange={setProofOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto overflow-x-hidden border-emerald-100 bg-white sm:rounded-[24px] lg:max-w-5xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-emerald-700">Tải minh chứng chi tiêu</DialogTitle>
          </DialogHeader>
          {selectedProofDisbursement ? (
            <div className="mx-auto w-full max-w-4xl">
              <ProofUploadForm
                disbursementId={selectedProofDisbursement._id}
                onSuccess={() => {
                  fetchData()
                  setProofOpen(false)
                }}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chưa có giải ngân đã hoàn tất để tải minh chứng.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
