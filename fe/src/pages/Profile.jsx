import { useState, useEffect, useCallback } from "react"
import { Link, useParams } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { updateProfile, changePassword, submitKYC, getMyDonations, getUserProfile, getUserCampaigns, getUserDonations } from "@/api/user.api"
import KYCStatusBanner from "@/components/kyc/KYCStatusBanner"
import KYCLayoutWithTips from "@/components/kyc/KYCLayoutWithTips"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import ImageUpload from "@/components/shared/ImageUpload"
import { KYC_STATUS } from "@/constants/enums"
import { formatVND, formatDate } from "@/lib/utils"
import { User, Lock, ShieldCheck, Heart, Pencil, Save, Loader2, Briefcase, ExternalLink, EyeOff } from "lucide-react"
import { toast } from "sonner"

const getInitials = (name) =>
  String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

// ─── Tab 1: Personal Info ────────────────────────────────────────────
function PersonalInfoTab({ user, refreshProfile }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    gender: "",
    dob: "",
    phone: "",
    bio: "",
    address: "",
    avatar: "",
  })

  const buildFormFromUser = (userData) => ({
    gender: userData?.gender || "",
    dob: userData?.dob ? new Date(userData.dob).toISOString().split("T")[0] : "",
    phone: userData?.phone || "",
    bio: userData?.bio || "",
    address: userData?.address || "",
    avatar: userData?.avatar || "",
  })

  useEffect(() => {
    if (user) {
      setForm(buildFormFromUser(user))
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenderChange = (value) => {
    setForm((prev) => ({ ...prev, gender: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        gender: form.gender || undefined,
        dob: form.dob || undefined,
        phone: form.phone || undefined,
        bio: form.bio || undefined,
        address: form.address || undefined,
        avatar: form.avatar || undefined,
      }
      const res = await updateProfile(payload)
      const updatedUser = res?.data?.data || res?.data
      if (updatedUser) {
        setForm(buildFormFromUser(updatedUser))
      }
      toast.success("Cập nhật thông tin thành công")
      setEditing(false)
      await refreshProfile()
    } catch (err) {
      const msg =
        err.response?.data?.message || "Cập nhật thông tin thất bại"
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    if (user) {
      setForm(buildFormFromUser(user))
    }
  }

  return (
    <Card className="rounded-3xl border border-slate-100 bg-white shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          Thông tin cá nhân
        </CardTitle>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Chỉnh sửa
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Hủy
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-3.5 w-3.5" />
              )}
              Lưu thay đổi
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex flex-col items-center gap-3 lg:w-48">
            <Avatar className="h-24 w-24">
              <AvatarImage src={form.avatar || user?.avatar} alt={user?.name} />
              <AvatarFallback className="text-2xl">
                {user?.name?.charAt(0)?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-base font-semibold text-slate-900">
                {user?.name || "Chưa cập nhật"}
              </p>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
            {editing && (
              <div className="w-full">
                <ImageUpload
                  label="Ảnh đại diện"
                  preview={form.avatar || user?.avatar}
                  onUpload={(url) => setForm((prev) => ({ ...prev, avatar: url || "" }))}
                />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-slate-500">Họ và tên</Label>
                <Input value={user?.name || ""} readOnly className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-slate-500">Email</Label>
                <Input value={user?.email || ""} readOnly className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-slate-500">Giới tính</Label>
                {editing ? (
                  <Select value={form.gender} onValueChange={handleGenderChange}>
                    <SelectTrigger className="bg-slate-50">
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={
                      form.gender === "MALE"
                        ? "Nam"
                        : form.gender === "FEMALE"
                          ? "Nữ"
                          : form.gender === "OTHER"
                            ? "Khác"
                            : "Chưa cập nhật"
                    }
                    readOnly
                    className="bg-slate-50"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-slate-500">Ngày sinh</Label>
                {editing ? (
                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    value={form.dob}
                    onChange={handleChange}
                    className="bg-slate-50"
                  />
                ) : (
                  <Input
                    value={
                      form.dob
                        ? new Date(form.dob).toLocaleDateString("vi-VN")
                        : "Chưa cập nhật"
                    }
                    readOnly
                    className="bg-slate-50"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-slate-500">Số điện thoại</Label>
                {editing ? (
                  <Input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    className="bg-slate-50"
                  />
                ) : (
                  <Input value={form.phone || "Chưa cập nhật"} readOnly className="bg-slate-50" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Địa chỉ</Label>
              {editing ? (
                <Input
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ"
                  className="bg-slate-50"
                />
              ) : (
                <Input value={form.address || "Chưa cập nhật"} readOnly className="bg-slate-50" />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Giới thiệu ngắn</Label>
              {editing ? (
                <Textarea
                  id="bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Viết vài dòng giới thiệu về bạn..."
                  rows={4}
                  className="bg-slate-50"
                />
              ) : (
                <Textarea value={form.bio || "Chưa cập nhật"} readOnly className="bg-slate-50" rows={4} />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Tab 2: Change Password ──────────────────────────────────────────
function ChangePasswordTab() {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    if (form.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự")
      return
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp")
      return
    }

    setLoading(true)
    try {
      await changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      })
      toast.success("Đổi mật khẩu thành công")
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err) {
      const msg =
        err.response?.data?.message || "Đổi mật khẩu thất bại"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-3xl border border-slate-100 bg-white shadow-sm">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-xl">Đổi mật khẩu</CardTitle>
        <p className="text-sm text-slate-500">Bảo vệ tài khoản của bạn bằng mật khẩu mạnh</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-5">
          <div className="space-y-2">
            <Label htmlFor="oldPassword" className="text-xs font-semibold uppercase text-slate-500">
              Mật khẩu hiện tại
            </Label>
            <Input
              id="oldPassword"
              name="oldPassword"
              type="password"
              value={form.oldPassword}
              onChange={handleChange}
              className="bg-slate-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-xs font-semibold uppercase text-slate-500">
              Mật khẩu mới
            </Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              className="bg-slate-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase text-slate-500">
              Xác nhận mật khẩu mới
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="bg-slate-50"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-full bg-emerald-600 py-6 text-base font-semibold text-white shadow-lg shadow-emerald-200"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Cập nhật mật khẩu"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// ─── Tab 3: KYC Verification ─────────────────────────────────────────
function KYCTab({ user, refreshProfile }) {
  const [loading, setLoading] = useState(false)
  const kycStatus = user?.kycStatus || KYC_STATUS.NONE

  const handleKYCSubmit = async (formData) => {
    setLoading(true)
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
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-3xl border border-slate-100 bg-white shadow-sm">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg">Xác minh danh tính</CardTitle>
        </div>
        <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase text-amber-700">
          {kycStatus === KYC_STATUS.APPROVED
            ? "Đã xác minh"
            : kycStatus === KYC_STATUS.PENDING
              ? "Đang xử lý"
              : "Chưa xác minh"}
        </span>
      </CardHeader>
      <CardContent className="space-y-6">
        <KYCStatusBanner status={kycStatus} />

        {(kycStatus === KYC_STATUS.NONE ||
          kycStatus === KYC_STATUS.REJECTED) && (
          <>
            <Separator />
            <KYCLayoutWithTips
              accountType={user?.accountType}
              onSubmit={handleKYCSubmit}
              isLoading={loading}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Tab 4: Donation History ──────────────────────────────────────────
function DonationHistoryTab() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const totalAmount = donations.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  )
  const totalCampaigns = new Set(
    donations
      .map((item) => item.campaignId?._id || item.campaignId || item.campaign?._id)
      .filter(Boolean)
      .map((value) => value.toString())
  ).size

  const fetchDonations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMyDonations({ page, limit: 10 })
      const payload = res.data?.data || res.data
      setDonations(Array.isArray(payload) ? payload : payload?.donations || [])
      if (payload?.pagination?.pages) setTotalPages(payload.pagination.pages)
    } catch (err) {
      const msg =
        err.response?.data?.message || "Không thể tải lịch sử đóng góp"
      toast.error(msg)
      setDonations([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchDonations()
  }, [fetchDonations])

  return (
    <Card className="rounded-3xl border border-slate-100 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Lịch sử đóng góp</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-emerald-700 p-6 text-white shadow-lg shadow-emerald-100">
            <p className="text-xs uppercase text-emerald-100">Tổng số tiền đóng góp</p>
            <p className="mt-3 text-3xl font-semibold">
              {formatVND(totalAmount || 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <p className="text-xs uppercase text-slate-400">Dự án đã hỗ trợ</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {totalCampaigns}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-100 bg-slate-50 p-5"
              >
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : donations.length === 0 ? (
          <div className="py-12 text-center">
            <Heart className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-4 text-sm text-slate-500">Bạn chưa có đóng góp nào.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {donations.map((donation) => {
              const id = donation._id || donation.id
              const campaignId =
                donation.campaignId?._id || donation.campaignId || donation.campaign?._id
              return (
                <div
                  key={id}
                  className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm sm:px-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">
                          {donation.campaignTitle || donation.campaignId?.title || "Chiến dịch"}
                        </p>
                        {(donation.isAnonymous || donation.anonymous) && (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-slate-400">
                            <EyeOff className="h-4 w-4" />
                            Ẩn danh
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(donation.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:items-end">
                      <p className="text-sm font-semibold text-emerald-700">
                        {formatVND(donation.amount)}
                      </p>
                      <span className="inline-flex w-fit rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                        {donation.paymentStatus === "SUCCESS" ? "THÀNH CÔNG" : "ĐANG XỬ LÝ"}
                      </span>
                      {campaignId && (
                        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                          <Link to={`/campaigns/${campaignId}`}>
                            Xem chi tiết
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                >
                  Trước
                </Button>
                <span className="text-sm text-slate-500">
                  Trang {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                >
                  Tiếp
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── View Mode Tab 1: Personal Info (Read-only) ──────────────────────
function PersonalInfoTabView({ userData }) {
  const genderLabel = {
    MALE: "Nam",
    FEMALE: "Nữ",
    OTHER: "Khác",
  }

  return (
    <Card className="rounded-3xl border border-slate-100 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl font-bold text-slate-900">
            Thông tin cá nhân
          </CardTitle>
          <Button asChild className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            <Link to={`/messages/${userData?._id}`}>Nhắn tin</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-slate-500">
              Họ và tên
            </Label>
            <Input
              value={userData?.name || "Chưa cập nhật"}
              disabled
              className="bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-slate-500">
              Email
            </Label>
            <Input
              value={userData?.email || "Chưa cập nhật"}
              disabled
              className="bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-slate-500">
              Giới tính
            </Label>
            <Input
              value={
                genderLabel[userData?.gender] || "Chưa cập nhật"
              }
              disabled
              className="bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-slate-500">
              Ngày sinh
            </Label>
            <Input
              value={
                userData?.dob
                  ? new Date(userData.dob).toLocaleDateString("vi-VN")
                  : "Chưa cập nhật"
              }
              disabled
              className="bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-slate-500">
              Số điện thoại
            </Label>
            <Input
              value={userData?.phone || "Chưa cập nhật"}
              disabled
              className="bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-slate-500">
              Địa chỉ
            </Label>
            <Input
              value={userData?.address || "Chưa cập nhật"}
              disabled
              className="bg-slate-50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase text-slate-500">
            Giới thiệu ngắn
          </Label>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 min-h-[120px]">
            <p className="text-sm text-slate-700">
              {userData?.bio || "Chưa có thông tin giới thiệu"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── View Mode Tab 2: Donation History (For Any User) ────────────────
function DonationHistoryTabView({ userId }) {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const totalAmount = donations.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  )
  const totalCampaigns = new Set(
    donations
      .map((item) => item.campaignId?._id || item.campaignId || item.campaign?._id)
      .filter(Boolean)
      .map((value) => value.toString())
  ).size

  const fetchDonations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getUserDonations(userId, { page, limit: 10 })
      const payload = res.data?.data || res.data
      setDonations(Array.isArray(payload) ? payload : payload?.donations || [])
      if (payload?.pagination?.pages) setTotalPages(payload.pagination.pages)
    } catch (err) {
      const msg =
        err.response?.data?.message || "Không thể tải lịch sử đóng góp"
      toast.error(msg)
      setDonations([])
    } finally {
      setLoading(false)
    }
  }, [userId, page])

  useEffect(() => {
    fetchDonations()
  }, [fetchDonations])

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="rounded-2xl border border-slate-100 bg-emerald-700 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-emerald-50">
              Tổng số tiền đóng góp
            </p>
            <p className="mt-2 text-2xl font-bold text-white">
              {formatVND(totalAmount)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-600">
              Dự án đã hỗ trợ
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {totalCampaigns}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Donations List */}
      <Card className="rounded-3xl border border-slate-100 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 p-8">
          <CardTitle className="text-lg font-bold text-slate-900">
            Lịch sử đóng góp
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-slate-100 bg-slate-50 p-5"
                >
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : donations.length === 0 ? (
            <div className="py-12 text-center">
              <Heart className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-4 text-sm text-slate-500">
                Chưa có đóng góp nào.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {donations.map((donation) => {
                const id = donation._id || donation.id
                const campaignId =
                  donation.campaignId?._id ||
                  donation.campaignId ||
                  donation.campaign?._id
                return (
                  <div
                    key={id}
                    className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm sm:px-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {donation.campaignTitle ||
                            donation.campaignId?.title ||
                            "Chiến dịch"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(donation.createdAt)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 sm:items-end">
                        <p className="text-sm font-semibold text-emerald-700">
                          {formatVND(donation.amount)}
                        </p>
                        <span className="inline-flex w-fit rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                          {donation.paymentStatus === "SUCCESS"
                            ? "THÀNH CÔNG"
                            : "ĐANG XỬ LÝ"}
                        </span>
                        {campaignId && (
                          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                            <Link to={`/campaigns/${campaignId}`}>
                              Xem chi tiết
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((p) => Math.max(p - 1, 1))
                    }
                  >
                    Trước
                  </Button>
                  <span className="text-sm text-slate-500">
                    Trang {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((p) => Math.min(p + 1, totalPages))
                    }
                  >
                    Tiếp
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── View Mode Tab 3: Created Campaigns ───────────────────────────────
function CreatedCampaignsTab({ userId }) {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true)
      try {
        const res = await getUserCampaigns(userId)
        const payload = res.data?.data || res.data
        setCampaigns(Array.isArray(payload) ? payload : payload?.campaigns || [])
      } catch (err) {
        const msg =
          err.response?.data?.message || "Không thể tải danh sách chiến dịch"
        toast.error(msg)
        setCampaigns([])
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [userId])

  return (
    <Card className="rounded-3xl border border-slate-100 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 p-8">
        <CardTitle className="text-lg font-bold text-slate-900">
          Chiến dịch đã tạo
        </CardTitle>
      </CardHeader>

      <CardContent className="p-8">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-100 bg-slate-50 p-5"
              >
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="py-12 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-4 text-sm text-slate-500">
              Chưa tạo chiến dịch nào.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const id = campaign._id || campaign.id
              const current = Number(campaign.currentAmount || 0)
              const goal = Number(campaign.goalAmount || 0)
              const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0

              return (
                <div
                  key={id}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-slate-900">
                        {campaign.title || "Chiến dịch"}
                      </h3>
                      <p className="mt-1 text-xs text-slate-400">
                        Tạo ngày: {campaign.createdAt ? formatDate(campaign.createdAt) : "N/A"}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/campaigns/${id}`}>
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Xem
                      </Link>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600">
                      {formatVND(current)} / {formatVND(goal)}
                    </span>
                    <span className="font-semibold text-emerald-600">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>

                  <Progress value={percentage} className="h-2 bg-slate-100" />
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Main Profile Page ───────────────────────────────────────────────
export default function Profile() {
  const { user, refreshProfile } = useAuth()
  const { profileID } = useParams()
  const [otherUserData, setOtherUserData] = useState(null)
  const [otherUserLoading, setOtherUserLoading] = useState(false)
  const [ownProfileTab, setOwnProfileTab] = useState("profile")
  const [otherProfileTab, setOtherProfileTab] = useState("profile")

  // Determine if viewing own profile or other user's profile
  const isOwnProfile = !profileID || profileID === user?._id

  // Fetch other user's profile data
  useEffect(() => {
    if (!isOwnProfile && profileID) {
      setOtherUserLoading(true)
      getUserProfile(profileID)
        .then((res) => {
          const userData = res.data?.data || res.data
          setOtherUserData(userData)
        })
        .catch((err) => {
          const msg =
            err.response?.data?.message || "Không thể tải hồ sơ người dùng"
          toast.error(msg)
          setOtherUserData(null)
        })
        .finally(() => {
          setOtherUserLoading(false)
        })
    }
  }, [profileID, isOwnProfile])

  // OWN PROFILE VIEW
  if (isOwnProfile) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Tài khoản của tôi
          </h1>
          <p className="mt-2 text-slate-500">
            Quản lý thông tin cá nhân và cài đặt tài khoản
          </p>
        </div>

        <Tabs value={ownProfileTab} onValueChange={setOwnProfileTab} className="space-y-6">
          <div className="sm:hidden">
            <Select value={ownProfileTab} onValueChange={setOwnProfileTab}>
              <SelectTrigger className="h-11 w-full rounded-full border-slate-200 bg-white shadow-sm">
                <SelectValue placeholder="Chọn mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profile">Thông tin cá nhân</SelectItem>
                <SelectItem value="password">Đổi mật khẩu</SelectItem>
                <SelectItem value="kyc">Xác minh danh tính</SelectItem>
                <SelectItem value="donations">Lịch sử đóng góp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsList className="mx-auto hidden w-full max-w-3xl flex-wrap justify-center gap-2 rounded-full border border-slate-100 bg-white p-2 shadow-sm sm:flex">
            <TabsTrigger
              value="profile"
              className="rounded-full px-4 py-2 text-sm font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <User className="mr-2 h-4 w-4" />
              Thông tin cá nhân
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="rounded-full px-4 py-2 text-sm font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Lock className="mr-2 h-4 w-4" />
              Đổi mật khẩu
            </TabsTrigger>
            <TabsTrigger
              value="kyc"
              className="rounded-full px-4 py-2 text-sm font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Xác minh danh tính
            </TabsTrigger>
            <TabsTrigger
              value="donations"
              className="rounded-full px-4 py-2 text-sm font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Heart className="mr-2 h-4 w-4" />
              Lịch sử đóng góp
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <PersonalInfoTab user={user} refreshProfile={refreshProfile} />
          </TabsContent>

          <TabsContent value="password">
            <ChangePasswordTab />
          </TabsContent>

          <TabsContent value="kyc">
            <KYCTab user={user} refreshProfile={refreshProfile} />
          </TabsContent>

          <TabsContent value="donations">
            <DonationHistoryTab />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // VIEWING OTHER USER'S PROFILE
  if (otherUserLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
            <p className="mt-4 text-slate-500">Đang tải hồ sơ...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!otherUserData) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="text-center py-20">
          <User className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 text-slate-500">Không tìm thấy hồ sơ người dùng</p>
          <Button asChild className="mt-6 bg-emerald-600 hover:bg-emerald-700">
            <Link to="/">Quay lại trang chủ</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Header with Avatar & Name */}
      <div className="mb-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Avatar className="h-28 w-28 flex-shrink-0 rounded-full border-4 border-emerald-100">
            <AvatarImage src={otherUserData?.avatar} alt={otherUserData?.name} />
            <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-teal-100 text-lg font-bold text-emerald-700">
              {getInitials(otherUserData?.name) || "?"}
            </AvatarFallback>
          </Avatar>

          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {otherUserData?.name || "Người dùng"}
            </h1>
            <p className="mt-1 text-slate-500">{otherUserData?.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={otherProfileTab} onValueChange={setOtherProfileTab} className="space-y-6">
        <div className="sm:hidden">
          <Select value={otherProfileTab} onValueChange={setOtherProfileTab}>
            <SelectTrigger className="h-11 w-full rounded-full border-slate-200 bg-white shadow-sm">
              <SelectValue placeholder="Chọn mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profile">Thông tin cá nhân</SelectItem>
              <SelectItem value="campaigns">Chiến dịch đã tạo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsList className="mx-auto hidden w-full max-w-3xl flex-wrap justify-center gap-2 rounded-full border border-slate-100 bg-white p-2 shadow-sm sm:flex">
          <TabsTrigger
            value="profile"
            className="rounded-full px-4 py-2 text-sm font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
          >
            <User className="mr-2 h-4 w-4" />
            Thông tin cá nhân
          </TabsTrigger>
          <TabsTrigger
            value="campaigns"
            className="rounded-full px-4 py-2 text-sm font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
          >
            <Briefcase className="mr-2 h-4 w-4" />
            Chiến dịch đã tạo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <PersonalInfoTabView userData={otherUserData} />
        </TabsContent>


        <TabsContent value="campaigns">
          <CreatedCampaignsTab userId={profileID} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
