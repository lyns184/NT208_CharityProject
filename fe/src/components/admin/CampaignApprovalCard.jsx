import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import StatusBadge from "@/components/shared/StatusBadge"
import { cn, formatVND, formatDate } from "@/lib/utils"
import {
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Eye,
  Sparkles,
  ExternalLink,
  ClipboardCopy,
  FileText,
} from "lucide-react"
import { toast } from "sonner"

const getDurationText = (campaign) => {
  const start = campaign.startDate || campaign.createdAt
  const end = campaign.endDate

  if (!start || !end) return "Chưa xác định"

  const startDate = new Date(start)
  const endDate = new Date(end)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "Chưa xác định"
  }

  const diffDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)))
  return `${diffDays} ngày`
}

export default function CampaignApprovalCard({ campaign, onApprove, onReject }) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [loading, setLoading] = useState(null)

  const isPending = campaign.status === "PENDING"

  const handleApprove = async () => {
    setLoading("approve")
    try {
      await onApprove(campaign)
      setDetailOpen(false)
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return
    setLoading("reject")
    try {
      await onReject(campaign, rejectReason.trim())
      setRejectOpen(false)
      setDetailOpen(false)
      setRejectReason("")
    } finally {
      setLoading(null)
    }
  }

  const copyCampaignId = async () => {
    try {
      await navigator.clipboard.writeText(campaign._id)
      toast.success("Đã sao chép mã chiến dịch")
    } catch {
      toast.error("Không thể sao chép mã chiến dịch")
    }
  }

  return (
    <>
      <Card className="overflow-hidden border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="truncate text-[15px] font-bold leading-snug text-slate-900 sm:text-base">
                {campaign.title}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {campaign.creatorId?.name || campaign.createdBy?.name || "Ẩn danh"}
                </span>
              </div>
            </div>

            <div className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
              {formatVND(campaign.goalAmount)}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <span>Kéo dài: {getDurationText(campaign)}</span>
            {campaign.createdAt && <span>{formatDate(campaign.createdAt)}</span>}
          </div>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 sm:w-auto"
              onClick={() => setDetailOpen(true)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </Button>

            <div className="flex items-center gap-2">
              {isPending && (
                <StatusBadge status={campaign.status} type="campaign" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="w-[min(96vw,80rem)] !max-w-[min(96vw,80rem)] overflow-hidden rounded-[28px] border-emerald-100 p-0" style={{ width: "min(96vw, 80rem)", maxWidth: "min(96vw, 80rem)" }}>
          <div className="max-h-[90vh] overflow-y-auto">
            {/* Header: Creator Avatar + Name */}
            <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 px-5 py-4 sm:px-8 sm:py-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                    <User className="h-6 w-6 text-emerald-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Người tạo</p>
                    <Link
                      to={`/profile/${campaign.creatorId?._id}`}
                      className="mt-0.5 truncate text-base font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      {campaign.creatorId?.name || campaign.createdBy?.name || "Ẩn danh"}
                    </Link>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={campaign.status} type="campaign" />
                </div>
              </div>
            </div>

            <div className="space-y-6 px-5 py-6 sm:px-8">
              {/* Banner Image */}
              {campaign.bannerImage && (
                <div className="overflow-hidden rounded-[20px] bg-slate-100">
                  <img
                    src={campaign.bannerImage}
                    alt={campaign.title}
                    className="h-auto w-full object-cover"
                    style={{ maxHeight: "300px" }}
                  />
                </div>
              )}

              {/* Title & Campaign ID */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  <Sparkles className="h-3.5 w-3.5" />
                  Chi tiết chiến dịch
                </div>
                <DialogTitle className="text-3xl font-bold tracking-tight text-slate-900">
                  {campaign.title}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <span>Mã:</span>
                  <code className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-700">
                    {campaign._id?.slice(0, 6)}...{campaign._id?.slice(-4)}
                  </code>
                  <button
                    type="button"
                    onClick={copyCampaignId}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <ClipboardCopy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-[22px] border border-emerald-100 bg-emerald-50/40 p-5">
                <p className="text-sm font-semibold text-slate-900">Mô tả dự án</p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {campaign.description || "Không có mô tả."}
                </p>
              </div>

              {/* Key Info: Amount, Created Date, End Date */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[18px] border border-emerald-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Số tiền mục tiêu</p>
                  <p className="mt-2 text-2xl font-extrabold text-emerald-700">
                    {formatVND(campaign.goalAmount)}
                  </p>
                </div>
                {campaign.createdAt && (
                  <div className="rounded-[18px] border border-emerald-100 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Ngày tạo</p>
                    <p className="mt-2 text-sm font-medium text-slate-700">{formatDate(campaign.createdAt)}</p>
                  </div>
                )}
                {campaign.endDate && (
                  <div className="rounded-[18px] border border-emerald-100 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Ngày kết thúc</p>
                    <p className="mt-2 text-sm font-medium text-slate-700">{formatDate(campaign.endDate)}</p>
                  </div>
                )}
              </div>

              {/* Rejection Reason */}
              {campaign.rejectionReason && (
                <div className="rounded-[18px] border border-destructive/20 bg-destructive/5 p-4">
                  <p className="text-sm text-destructive">
                    <span className="font-semibold">Lý do từ chối:</span> {campaign.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-emerald-100 bg-white px-5 py-4 sm:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  variant="outline"
                  className="rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                  onClick={() => setDetailOpen(false)}
                >
                  Đóng
                </Button>
                {isPending && (
                  <>
                    <Button
                      className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={handleApprove}
                      disabled={loading !== null}
                    >
                      {loading === "approve" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Duyệt ngay
                    </Button>
                    <Button
                      variant="destructive"
                      className="rounded-full"
                      onClick={() => setRejectOpen(true)}
                      disabled={loading !== null}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Từ chối
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-2xl rounded-[24px] border-emerald-100">
          <DialogHeader>
            <DialogTitle>Từ chối chiến dịch</DialogTitle>
            <DialogDescription>
              Nhập lý do từ chối cho chiến dịch "{campaign.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Textarea
              placeholder="Lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectOpen(false)}
              disabled={loading === "reject"}
            >
              Huỷ
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || loading === "reject"}
            >
              {loading === "reject" ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : null}
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}