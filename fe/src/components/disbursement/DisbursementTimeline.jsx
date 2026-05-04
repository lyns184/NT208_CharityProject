import { useState } from "react"
import { Eye, Upload } from "lucide-react"
import { DISBURSEMENT_STATUS } from "@/constants/enums"
import { formatVND, formatDate } from "@/lib/utils"
import StatusBadge from "@/components/shared/StatusBadge"
import BlockchainLink from "@/components/shared/BlockchainLink"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function statusLabel(status) {
  switch (status) {
    case DISBURSEMENT_STATUS.PENDING_VERIFY:
    case DISBURSEMENT_STATUS.PENDING_TRANSFER:
      return "Chờ xác minh"
    case DISBURSEMENT_STATUS.COMPLETED:
      return "Đã giải ngân"
    default:
      return status
  }
}

export default function DisbursementTimeline({
  disbursements = [],
  onUploadProof,
}) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState("")

  const openDetail = (disbursement) => {
    setSelected(disbursement)
    setDetailOpen(true)
  }

  if (!disbursements.length) return null

  return (
    <>
      <div className="space-y-3">
        {disbursements.map((d) => {
          const amount = formatVND(d.amount)
          const time = formatDate(d.createdAt)
          const content = d.reason || d.description || "Không có nội dung"
          const isCompleted =
            d.status === DISBURSEMENT_STATUS.COMPLETED ||
            d.status === DISBURSEMENT_STATUS.PENDING_VERIFY ||
            d.status === DISBURSEMENT_STATUS.PENDING_TRANSFER

          return (
            <CardRow
              key={d._id}
              amount={amount}
              time={time}
              content={content}
              status={d.status}
              onView={() => openDetail(d)}
              onUploadProof={isCompleted ? () => onUploadProof?.(d) : null}
            />
          )
        })}
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto overflow-x-hidden border-emerald-100 p-0 sm:rounded-[28px] lg:max-w-7xl">
          <DialogHeader className="border-b border-emerald-100 bg-linear-to-r from-emerald-50 to-white px-6 py-5 sm:px-8">
            <DialogTitle className="text-xl font-bold tracking-tight text-emerald-800">
              Chi tiết lịch sử giải ngân
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="mx-auto flex w-full max-w-4xl flex-col items-center space-y-5 px-6 py-6 text-center sm:px-8">
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
                <InfoBlock label="Số tiền" value={formatVND(selected.amount)} />
                <InfoBlock label="Thời gian" value={formatDate(selected.createdAt)} />
                <InfoBlock label="Trạng thái" value={statusLabel(selected.status)} />
              </div>

              <div className="w-full space-y-2 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Nội dung</p>
                <p className="text-sm leading-relaxed text-slate-700">
                  {selected.reason || selected.description || "Không có nội dung"}
                </p>
              </div>

              {selected.transferProofImage && (
                <div className="w-full space-y-2 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Bill chuyển khoản từ admin
                  </p>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setLightboxImage(selected.transferProofImage)
                        setLightboxOpen(true)
                      }}
                      className="overflow-hidden rounded-2xl border border-emerald-100 transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    >
                      <img
                        src={selected.transferProofImage}
                        alt="Bill chuyển khoản"
                        className="h-44 w-full object-cover bg-linear-to-b from-emerald-50 to-white"
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Owner uploaded proof images */}
              {((selected.proofImages && selected.proofImages.length > 0) || (selected.images && selected.images.length > 0)) && (
                <div className="w-full space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Hình ảnh minh chứng chi tiêu
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {(selected.proofImages ?? selected.images ?? []).filter(Boolean).map((img, i) => {
                      const src = typeof img === 'string' ? img : img?.url ?? img
                      if (!src) return null
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setLightboxImage(src)
                            setLightboxOpen(true)
                          }}
                          className="overflow-hidden rounded-2xl border border-emerald-100 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-300"
                          aria-label={`Xem ảnh minh chứng ${i + 1}`}
                        >
                          <img src={src} alt={`Minh chứng ${i + 1}`} className="h-28 w-28 object-cover bg-white" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {(selected.transferProofHash || selected.transferTxHash || selected.blockchainTxHash) && (
                <div className="w-full space-y-1.5 rounded-2xl border border-emerald-100 bg-white p-4 text-center text-xs text-slate-600 shadow-sm">
                  {selected.transferProofHash && (
                    <p className="break-all">
                      <span className="font-semibold text-emerald-700">Mã chứng từ:</span> {selected.transferProofHash}
                    </p>
                  )}
                  {(selected.transferTxHash || selected.blockchainTxHash) && (
                    <p className="break-all">
                      <span className="font-semibold text-emerald-700">Blockchain:</span>{" "}
                      <BlockchainLink txHash={selected.transferTxHash || selected.blockchainTxHash} />
                    </p>
                  )}
                </div>
              )}

              {(selected.status === DISBURSEMENT_STATUS.COMPLETED || selected.status === 'PENDING_VERIFY') && onUploadProof && (
                <div className="flex w-full justify-center">
                  <Button
                    type="button"
                    onClick={() => onUploadProof(selected)}
                    className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Tải minh chứng chi tiêu
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Lightbox for proof images */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto overflow-x-hidden border-emerald-100 p-0 sm:rounded-[24px] lg:max-w-5xl">
          <DialogHeader className="border-b border-emerald-100 bg-linear-to-r from-emerald-50 to-white px-5 py-4 sm:px-6">
            <DialogTitle className="text-emerald-800">Ảnh minh chứng</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center bg-emerald-50/40 p-4 sm:p-6">
            <img
              src={lightboxImage}
              alt="Ảnh minh chứng phóng to"
              className="max-h-[75vh] w-auto rounded-2xl object-contain shadow-sm"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function CardRow({ amount, time, content, status, onView, onUploadProof }) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <p className="text-sm font-semibold">{amount}</p>
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
        <StatusBadge status={status} type="disbursement" />
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-slate-600">
        {content}
      </p>

      <div className="mt-4 flex gap-2 justify-end">
        {onUploadProof && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onUploadProof}
            className="text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          >
            <Upload className="mr-2 h-4 w-4" />
            Tải minh chứng
          </Button>
        )}
        <Button type="button" variant="outline" size="sm" onClick={onView}>
          <Eye className="mr-2 h-4 w-4" />
          Xem chi tiết
        </Button>
      </div>
    </div>
  )
}

function InfoBlock({ label, value }) {
  return (
    <div className="rounded-lg border border-emerald-100 bg-emerald-50/30 p-3 text-center">
      <p className="text-xs text-emerald-700">{label}</p>
      <p className="mt-1 text-sm font-semibold wrap-break-word text-slate-800">{value}</p>
    </div>
  )
}