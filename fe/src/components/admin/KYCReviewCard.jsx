import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import StatusBadge from "@/components/shared/StatusBadge"
import { formatDate } from "@/lib/utils"
import { ACCOUNT_TYPE } from "@/constants/enums"
import {
  CheckCircle,
  XCircle,
  ZoomIn,
  Loader2,
  User,
  Sparkles,
  FileText,
  ClipboardCopy,
} from "lucide-react"
import { toast } from "sonner"

export default function KYCReviewCard({ kyc, onApprove, onReject }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState("")
  const [profileOpen, setProfileOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [loading, setLoading] = useState(null)

  const user = kyc.user ?? kyc
  const documents = kyc.documents ?? kyc.kycDocuments ?? []
  const initials = (user.name || "U").charAt(0).toUpperCase()
  const profileDocs = [
    { label: "Mặt trước CCCD", url: user.idCardFront },
    { label: "Mặt sau CCCD", url: user.idCardBack },
    { label: "Ảnh chân dung", url: user.portrait },
    { label: "Giấy phép kinh doanh", url: user.businessLicense },
    { label: "Thư uỷ quyền", url: user.authorizationLetter || user.authLetter },
    { label: "CMND người đại diện", url: user.representativeIdCard || user.repIdCard },
  ].filter((item) => Boolean(item.url))

  const status = kyc.kycStatus ?? kyc.status
  const isPending = status === "PENDING"

  const handleApprove = async () => {
    setLoading("approve")
    try {
      await onApprove(kyc)
      setProfileOpen(false)
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return
    setLoading("reject")
    try {
      await onReject(kyc, rejectReason.trim())
      setRejectOpen(false)
      setProfileOpen(false)
      setRejectReason("")
    } finally {
      setLoading(null)
    }
  }

  const openLightbox = (src) => {
    setLightboxImage(src)
    setLightboxOpen(true)
  }

  const copyUserId = async () => {
    try {
      await navigator.clipboard.writeText(user._id || kyc._id)
      toast.success("Đã sao chép mã người dùng")
    } catch {
      toast.error("Không thể sao chép mã người dùng")
    }
  }

  return (
    <>
      <Card className="overflow-hidden border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar className="h-10 w-10 shrink-0 ring-2 ring-emerald-100">
                {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-[15px] font-bold leading-snug text-slate-900 sm:text-base">
                  {user.name || "N/A"}
                </p>
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{user.email || ""}</span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              {user.accountType && (
                <Badge variant="outline" className="rounded-full border-emerald-200 text-emerald-700">
                  {user.accountType === ACCOUNT_TYPE.ORGANIZATION ? "Tổ chức" : "Cá nhân"}
                </Badge>
              )}
              <StatusBadge status={status} type="kyc" />
            </div>
          </div>

          {kyc.submittedAt && (
            <p className="text-xs text-slate-500">Ngày nộp: {formatDate(kyc.submittedAt)}</p>
          )}

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 sm:w-auto"
              onClick={() => setProfileOpen(true)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Xem hồ sơ
            </Button>

            {isPending ? (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={handleApprove}
                  disabled={loading !== null}
                >
                  {loading === "approve" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Duyệt
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="rounded-full"
                  onClick={() => setRejectOpen(true)}
                  disabled={loading !== null}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Từ chối
                </Button>
              </div>
            ) : null}
          </div>

          {kyc.rejectionReason && (
            <p className="rounded-[18px] border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              Lý do từ chối: {kyc.rejectionReason}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="w-[min(96vw,72rem)] !max-w-[min(96vw,72rem)] rounded-[24px] border-emerald-100 p-3 sm:p-5" style={{ width: "min(96vw, 72rem)", maxWidth: "min(96vw, 72rem)" }}>
          <DialogHeader>
            <DialogTitle>Tài liệu KYC</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            <img
              src={lightboxImage}
              alt="Tài liệu KYC phóng to"
              className="max-h-[75vh] w-auto rounded-md object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="w-[min(96vw,92rem)] !max-w-[min(96vw,92rem)] overflow-hidden rounded-[28px] border-emerald-100 p-0" style={{ width: "min(96vw, 92rem)", maxWidth: "min(96vw, 92rem)" }}>
          <div className="max-h-[90vh] overflow-y-auto">
            <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 px-5 py-5 sm:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    <Sparkles className="h-3.5 w-3.5" />
                    Chi tiết KYC
                  </div>
                  <div className="space-y-2">
                    <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      {user.name || "Chưa cập nhật"}
                    </DialogTitle>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                      <span>Mã người dùng:</span>
                      <code className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-700">
                        {(user._id || kyc._id || "--").toString().slice(0, 6)}...{(user._id || kyc._id || "--").toString().slice(-4)}
                      </code>
                      <button
                        type="button"
                        onClick={copyUserId}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <ClipboardCopy className="h-3.5 w-3.5" />
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {user.accountType && (
                    <Badge variant="outline" className="rounded-full border-emerald-200 text-emerald-700">
                      {user.accountType === ACCOUNT_TYPE.ORGANIZATION ? "Tổ chức" : "Cá nhân"}
                    </Badge>
                  )}
                  <StatusBadge status={status} type="kyc" />
                </div>
              </div>
            </div>

            <div className="space-y-6 px-5 py-5 sm:px-8 sm:py-6">
              <section className="rounded-[24px] border border-emerald-100 bg-emerald-50/40 p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-800">
                  <FileText className="h-4 w-4" />
                  Thông tin hồ sơ
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[22px] border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <Avatar className="h-16 w-16 shrink-0 ring-2 ring-emerald-100">
                        {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-slate-900">
                          {user.name || "Chưa cập nhật"}
                        </p>
                        <p className="text-sm text-slate-500">{user.email || "Chưa cập nhật"}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <div>
                        <span className="font-medium text-slate-900">Giới tính: </span>
                        {user.gender === "MALE"
                          ? "Nam"
                          : user.gender === "FEMALE"
                            ? "Nữ"
                            : user.gender === "OTHER"
                              ? "Khác"
                              : "Chưa cập nhật"}
                      </div>
                      <div>
                        <span className="font-medium text-slate-900">Ngày sinh: </span>
                        {user.dob ? formatDate(user.dob) : "Chưa cập nhật"}
                      </div>
                      <div>
                        <span className="font-medium text-slate-900">Số điện thoại: </span>
                        {user.phone || "Chưa cập nhật"}
                      </div>
                      <div>
                        <span className="font-medium text-slate-900">Địa chỉ: </span>
                        {user.address || "Chưa cập nhật"}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-[22px] border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
                      <p className="text-sm font-semibold text-slate-900">Trạng thái KYC</p>
                      <div className="mt-3">
                        <StatusBadge status={status} type="kyc" />
                      </div>
                      {kyc.submittedAt && (
                        <p className="mt-3 text-sm text-slate-500">
                          Ngày nộp: {formatDate(kyc.submittedAt)}
                        </p>
                      )}
                    </div>

                    <div className="rounded-[22px] border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
                      <p className="text-sm font-semibold text-slate-900">Loại tài khoản</p>
                      <p className="mt-2 text-sm text-slate-600">
                        {user.accountType === ACCOUNT_TYPE.ORGANIZATION ? "Tổ chức" : "Cá nhân"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Tài liệu đã nộp - removed per admin UI update */}

              {profileDocs.length > 0 && (
                <section className="rounded-[24px] border border-emerald-100 bg-white p-4 sm:p-5">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-800">
                    <Sparkles className="h-4 w-4" />
                    Hồ sơ bổ sung
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {profileDocs.map((doc) => (
                      <button
                        key={doc.label}
                        type="button"
                        onClick={() => openLightbox(doc.url)}
                        className="overflow-hidden rounded-[18px] border border-emerald-100 text-left transition-colors hover:bg-emerald-50/40"
                      >
                        <img src={doc.url} alt={doc.label} className="h-44 w-full object-cover" />
                        <div className="px-3 py-2 text-sm font-medium text-slate-700">
                          {doc.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {kyc.rejectionReason && (
                <p className="rounded-[18px] border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                  Lý do từ chối: {kyc.rejectionReason}
                </p>
              )}
            </div>

            <div className="border-t border-emerald-100 bg-white px-5 py-4 sm:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  variant="outline"
                  className="rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                  onClick={() => setProfileOpen(false)}
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
            <DialogTitle>Từ chối KYC</DialogTitle>
            <DialogDescription>
              Nhập lý do từ chối cho hồ sơ của {user.name || "người dùng"}.
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