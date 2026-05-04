import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import BlockchainLink from "@/components/shared/BlockchainLink"
import ImageUpload from "@/components/shared/ImageUpload"
import { cn, formatDate, formatVND } from "@/lib/utils"
import {
  Banknote,
  CheckCircle2,
  ClipboardCopy,
  ExternalLink,
  Hash,
  ImageIcon,
  Loader2,
  MoveRight,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { DISBURSEMENT_STATUS } from "@/constants/enums"

export default function DisbursementManageCard({ disbursement, onTransfer }) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [adminBillImage, setAdminBillImage] = useState("")
  const [loading, setLoading] = useState(false)

  const status = disbursement?.status
  const proofImages = useMemo(
    () => disbursement?.proofImages ?? disbursement?.images ?? [],
    [disbursement]
  )
  const qrImage =
    disbursement?.requestQrImage ||
    disbursement?.requestQrUrl ||
    disbursement?.payoutQrImage ||
    disbursement?.qrImage ||
    ""

  const isCompleted = status === DISBURSEMENT_STATUS.COMPLETED
  const isPending = status === DISBURSEMENT_STATUS.PENDING_VERIFY
  const statusMeta = isCompleted
    ? {
        label: "Đã giải ngân",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      }
    : {
        label: "Chờ giải ngân",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      }

  useEffect(() => {
    if (!detailOpen) return
    setAdminBillImage(disbursement?.transferProofImage || "")
  }, [detailOpen, disbursement])

  const shortCampaignId = disbursement?.campaignId
    ? `${String(disbursement.campaignId).slice(0, 6)}...${String(disbursement.campaignId).slice(-4)}`
    : "--"

  const shortHash = (value) => {
    if (!value) return "--"
    const stringValue = String(value)
    if (stringValue.length <= 18) return stringValue
    return `${stringValue.slice(0, 10)}...${stringValue.slice(-8)}`
  }

  const copyToClipboard = async (text, message) => {
    if (!text || text === "--") return
    try {
      await navigator.clipboard.writeText(text)
      toast.success(message)
    } catch {
      toast.error("Không thể sao chép dữ liệu")
    }
  }

  const handleConfirmTransfer = async () => {
    if (!adminBillImage.trim()) {
      toast.error("Vui lòng tải ảnh bill chuyển tiền")
      return
    }

    setLoading(true)
    try {
      await onTransfer(disbursement, {
        transferProofImage: adminBillImage,
      })
      toast.success("Đã xác nhận chuyển khoản")
      setDetailOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <h4 className="truncate text-[15px] font-bold leading-snug text-slate-900 sm:text-base">
                {disbursement.campaignTitle || "Giải ngân"}
              </h4>
              <div className="flex items-center gap-2 text-sm text-emerald-700">
                <Banknote className="h-4 w-4 shrink-0" />
                <span className="font-extrabold tracking-tight text-emerald-700 sm:text-lg">
                  {formatVND(disbursement.amount)}
                </span>
              </div>
            </div>

            <Badge
              variant="outline"
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                statusMeta.className
              )}
            >
              {statusMeta.label}
            </Badge>
          </div>

          <p className="text-xs text-slate-500">
            Yêu cầu: {formatDate(disbursement.createdAt)}
          </p>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              {isCompleted
                ? "Yêu cầu đã hoàn tất và có thể xem toàn bộ chi tiết đối soát."
                : "Yêu cầu đang chờ admin xử lý chuyển khoản."}
            </p>

            <Button
              type="button"
              size="sm"
              variant={isCompleted ? "outline" : "default"}
              className={cn(
                "w-full rounded-full sm:w-auto",
                isCompleted
                  ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              )}
              onClick={() => setDetailOpen(true)}
            >
              {isCompleted ? "Xem chi tiết" : "Xử lý ngay"}
              <MoveRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent
          className="!w-[min(96vw,96rem)] !max-w-[min(96vw,96rem)] overflow-hidden rounded-[28px] border-emerald-100 p-0"
          style={{ width: "min(96vw, 96rem)", maxWidth: "min(96vw, 96rem)" }}
        >
          <div className="max-h-[90vh] overflow-y-auto">
            <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 px-5 py-5 sm:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    <Sparkles className="h-3.5 w-3.5" />
                    Chi tiết giải ngân
                  </div>
                  <div className="space-y-2">
                    <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      {disbursement.campaignTitle || "Giải ngân"}
                    </DialogTitle>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                      <span>Mã chiến dịch:</span>
                      <code className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-700">
                        {shortCampaignId}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(disbursement.campaignId, "Đã sao chép mã chiến dịch")}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <ClipboardCopy className="h-3.5 w-3.5" />
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      statusMeta.className
                    )}
                  >
                    {statusMeta.label}
                  </Badge>
                  {disbursement.campaignId && (
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      <Link
                        to={`/campaigns/${disbursement.campaignId}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Xem trang dự án
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6 px-5 py-5 sm:px-8 sm:py-6">
              <section className="rounded-[24px] border border-emerald-100 bg-emerald-50/40 p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-800">
                  <QrCode className="h-4 w-4" />
                  Thanh toán & QR Code
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
                  <div className="rounded-[22px] border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          QR ngân hàng của chủ dự án
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Quét mã để thực hiện chuyển khoản chính xác theo yêu cầu.
                        </p>
                      </div>
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    </div>

                    {qrImage ? (
                      <div className="overflow-hidden rounded-[20px] border border-emerald-100 bg-gradient-to-b from-emerald-50 to-white p-3">
                        <img
                          src={qrImage}
                          alt="QR nhận tiền"
                          className="mx-auto h-[360px] w-full max-w-[360px] object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex min-h-[360px] items-center justify-center rounded-[20px] border border-dashed border-emerald-200 bg-white text-center text-sm text-slate-500">
                        Chủ dự án chưa tải lên QR nhận tiền.
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-[22px] border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
                      <p className="text-sm font-semibold text-slate-900">Số tiền cần giải ngân</p>
                      <p className="mt-2 text-3xl font-extrabold tracking-tight text-emerald-700">
                        {formatVND(disbursement.amount)}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Yêu cầu: {formatDate(disbursement.createdAt)}
                      </p>
                      <p className="mt-3 text-sm text-slate-500">
                        {isPending
                          ? "Ưu tiên tải bill chuyển tiền lên ngay sau khi giao dịch hoàn tất."
                          : "Khoản giải ngân đã được xác nhận và lưu lại lịch sử đối soát."}
                      </p>
                    </div>

                    <div className="rounded-[22px] border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
                      <p className="text-sm font-semibold text-slate-900">Mã giao dịch</p>
                      <div className="mt-3 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-slate-500" />
                          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            Mã chứng từ
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
                          <span className="min-w-0 flex-1 break-all font-mono text-xs text-slate-700">
                            {shortHash(disbursement.transferProofHash)}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                disbursement.transferProofHash,
                                "Đã sao chép mã chứng từ"
                              )
                            }
                            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <ClipboardCopy className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            Blockchain
                          </span>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                          <BlockchainLink
                            txHash={disbursement.blockchainTxHash || disbursement.transferTxHash}
                            className="flex-wrap"
                          />
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-slate-500">
                        Dùng để đối soát giữa bill chuyển tiền và dữ liệu blockchain.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-800">
                  <ImageIcon className="h-4 w-4" />
                  Đối soát bằng chứng
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[24px] border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Bill chuyển tiền của admin
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {isPending
                            ? "Tải ảnh bill chuyển khoản thành công để hoàn tất xử lý."
                            : "Ảnh bill đã được lưu vào hồ sơ giải ngân."}
                        </p>
                      </div>
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Loader2 className="h-5 w-5 text-amber-500" />
                      )}
                    </div>

                    {isPending ? (
                      <div className="rounded-[20px] border border-dashed border-emerald-200 bg-emerald-50/30 p-3">
                        <ImageUpload
                          label="Tải ảnh bill chuyển tiền"
                          preview={adminBillImage}
                          onUpload={(url) => setAdminBillImage(url || "")}
                        />
                      </div>
                    ) : adminBillImage || disbursement.transferProofImage ? (
                      <div className="overflow-hidden rounded-[20px] border border-emerald-100 bg-emerald-50/20 p-3">
                        <img
                          src={adminBillImage || disbursement.transferProofImage}
                          alt="Bill chuyển tiền"
                          className="h-72 w-full rounded-[16px] object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex min-h-[260px] items-center justify-center rounded-[20px] border border-dashed border-emerald-200 bg-emerald-50/20 text-sm text-slate-500">
                        Chưa có bill chuyển tiền.
                      </div>
                    )}
                  </div>

                  <div className="rounded-[24px] border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Minh chứng chi tiêu của dự án
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Kiểm tra các ảnh chứng minh chủ dự án đã sử dụng đúng mục đích.
                        </p>
                      </div>
                      <Sparkles className="h-5 w-5 text-emerald-600" />
                    </div>

                    {proofImages.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {proofImages.map((img, index) => {
                          const src = typeof img === "string" ? img : img?.url ?? img
                          if (!src) return null

                          return (
                            <div
                              key={`${src}-${index}`}
                              className="overflow-hidden rounded-[18px] border border-emerald-100 bg-emerald-50/20"
                            >
                              <img
                                src={src}
                                alt={`Minh chứng ${index + 1}`}
                                className="h-40 w-full object-cover"
                              />
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex min-h-[260px] items-center justify-center rounded-[20px] border border-dashed border-emerald-200 bg-emerald-50/20 px-6 text-center text-sm text-slate-500">
                        Đang chờ chủ dự án cập nhật minh chứng...
                      </div>
                    )}
                  </div>
                </div>
              </section>

            </div>

            {isPending && (
              <div className="border-t border-emerald-100 bg-white px-5 py-4 sm:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                    onClick={() => setDetailOpen(false)}
                    disabled={loading}
                  >
                    Đóng
                  </Button>
                  <Button
                    type="button"
                    className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={handleConfirmTransfer}
                    disabled={loading || !adminBillImage.trim()}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Xác nhận chuyển khoản
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
