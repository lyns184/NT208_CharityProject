import { useState, useEffect, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { getCampaignDetail, getCampaignDonations, getCampaignSummary } from "@/api/campaign.api"
import { getCampaignStatementPdfUrl } from "@/api/report.api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProgressBar from "@/components/shared/ProgressBar"
import { DetailSkeleton } from "@/components/shared/LoadingSkeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Calendar, CalendarClock, Clock, MapPin, ReceiptText } from "lucide-react"
import { ACCOUNT_TYPE, CAMPAIGN_STATUS } from "@/constants/enums"
import { daysRemaining, formatDate, formatVND } from "@/lib/utils"
import { toast } from "sonner"
import CampaignDonationsTab from "@/components/campaign/CampaignDonationsTab"
import CampaignReportsTab from "@/components/campaign/CampaignReportsTab"
import CampaignActivityFeed from "@/components/social/CampaignActivityFeed"
import DonateForm from "@/components/donation/DonateForm"
import QRModal from "@/components/donation/QRModal"

const PLACEHOLDER_IMAGE = "https://placehold.co/1400x520?text=Campaign+Banner"

export default function CampaignDetail() {
  const { id } = useParams()
  const { user } = useAuth()

  const [campaign, setCampaign] = useState(null)
  const [summary, setSummary] = useState(null)
  const [donations, setDonations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [donateOpen, setDonateOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [payment, setPayment] = useState(null)
  const [activeTab, setActiveTab] = useState("story")

  const fetchData = useCallback(async (silent = false) => {
    if (!id) return
    if (!silent) {
      setIsLoading(true)
      setError(null)
    }

    try {
      const [campaignRes, summaryRes, donationRes] = await Promise.all([
        getCampaignDetail(id),
        getCampaignSummary(id),
        getCampaignDonations(id),
      ])

      const campaignPayload = campaignRes.data?.data || campaignRes.data
      const summaryPayload = summaryRes.data?.data || summaryRes.data
      const donationPayload = donationRes.data?.data || donationRes.data

      setCampaign(campaignPayload?.campaign ?? campaignPayload)
      setSummary(summaryPayload)
      setDonations(donationPayload?.donations || [])
    } catch (err) {
      if (!silent) {
        const message = err.response?.data?.message || "Không thể tải thông tin chiến dịch."
        setError(message)
        toast.error(message)
      }
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (isLoading) return <DetailSkeleton />

  if (error || !campaign) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">Không thể tải chiến dịch</h2>
        <p className="mb-6 text-muted-foreground">{error || "Chiến dịch không tồn tại hoặc đã bị xóa."}</p>
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay về trang chủ
          </Link>
        </Button>
      </div>
    )
  }

  const {
    _id: campaignId,
    title,
    description,
    image,
    imageUrl,
    status,
    currentAmount: currentAmountField = 0,
    currentBalance: currentBalanceField = 0,
    goalAmount = 0,
    endDate,
    creator,
    creatorId,
    location,
  } = campaign

  const creatorInfo = creator || creatorId || {}
  const creatorName = creatorInfo?.fullName || creatorInfo?.name || "Ẩn danh"
  const creatorAvatar = creatorInfo?.avatarUrl || creatorInfo?.avatar || ""
  const creatorInitial = creatorName.charAt(0).toUpperCase()
  const creatorTypeBadge = creatorInfo?.accountType === ACCOUNT_TYPE.ORGANIZATION ? "Tổ chức" : "Cá nhân"

  const currentAmount = currentBalanceField || currentAmountField || 0
  const remaining = daysRemaining(endDate)
  const progress = goalAmount > 0 ? Math.min(Math.round((currentAmount / goalAmount) * 100), 100) : 0
  const supportCount = donations.length
  const reportDisbursements = summary?.disbursements || []
  const isOwner = user?._id && creatorInfo?._id && user._id.toString() === creatorInfo._id.toString()
  const canDonate = status === CAMPAIGN_STATUS.ACTIVE

  const handlePaymentCreated = (paymentData) => {
    setPayment(paymentData || null)
    setDonateOpen(false)
    setQrOpen(true)
  }

  const handlePaymentSuccess = () => {
    fetchData(true)
  }

  const handleOpenStatement = () => {
    if (!campaignId) return
    window.open(getCampaignStatementPdfUrl(campaignId), "_blank", "noopener,noreferrer")
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" size="sm" className="mb-5 -ml-2">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Link>
      </Button>

      <div className="space-y-8">
        <div className="overflow-hidden rounded-[36px] border border-emerald-100 bg-white shadow-sm">
          <img
            src={image?.url || image || imageUrl || PLACEHOLDER_IMAGE}
            alt={title || "Campaign image"}
            className="aspect-16/6 w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER_IMAGE
            }}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.9fr)]">
          <div className="space-y-6">
            <div className="sm:hidden">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="h-11 w-full rounded-full border-emerald-200 bg-white">
                  <SelectValue placeholder="Chọn mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="story">Câu chuyện</SelectItem>
                  <SelectItem value="donations">Danh sách ủng hộ</SelectItem>
                  <SelectItem value="reports">Báo cáo chi tiêu</SelectItem>
                  <SelectItem value="activity">Hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-6">
              <TabsList variant="line" className="hidden w-full flex-wrap justify-start gap-2 border-b border-emerald-100 pb-2 sm:flex">
                <TabsTrigger value="story" className="rounded-full px-4">Câu chuyện</TabsTrigger>
                <TabsTrigger value="donations" className="rounded-full px-4">Danh sách ủng hộ</TabsTrigger>
                <TabsTrigger value="reports" className="rounded-full px-4">Báo cáo chi tiêu</TabsTrigger>
                <TabsTrigger value="activity" className="rounded-full px-4">Hoạt động</TabsTrigger>
              </TabsList>

              <TabsContent value="story" className="mt-6">
                <Card className="rounded-[32px] border-emerald-100 bg-white shadow-sm">
                  <CardContent className="space-y-4 p-6 sm:p-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
                    <p className="whitespace-pre-wrap text-[15px] leading-8 text-slate-700">{description || "Không có mô tả."}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="donations" className="mt-6">
                <CampaignDonationsTab donations={donations} />
              </TabsContent>

              <TabsContent value="reports" className="mt-6">
                <CampaignReportsTab disbursements={reportDisbursements} />
              </TabsContent>

              <TabsContent value="activity" className="mt-6">
                <CampaignActivityFeed campaignId={campaignId} creatorId={creatorInfo?._id} />
                {isOwner && (
                  <div className="mt-4 flex justify-end">
                    <Button asChild className="rounded-full bg-emerald-600 hover:bg-emerald-700">
                      <Link to={`/social/create?campaignId=${campaignId}&tag=ACTIVITY`}>Tạo bài viết</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <aside className="space-y-6">
            <Card className="rounded-[32px] border-emerald-100 bg-white shadow-sm">
              <CardContent className="space-y-5 p-6">
                <Link to={`/profile/${creatorInfo?._id}`} className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
                  <Avatar className="h-14 w-14 ring-2 ring-emerald-100">
                    <AvatarImage src={creatorAvatar} alt={creatorName} />
                    <AvatarFallback>{creatorInitial}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Chủ chiến dịch</p>
                    <p className="text-lg font-semibold text-slate-900">{creatorName}</p>
                    <Badge variant="outline" className="mt-1 border-emerald-200 text-emerald-700">{creatorTypeBadge}</Badge>
                  </div>
                </Link>

                <div className="space-y-4 rounded-[28px] bg-emerald-50/60 p-5">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Mục tiêu chiến dịch</span>
                    <span className="font-semibold text-slate-900">{formatVND(goalAmount)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Thời gian còn lại</span>
                    <span className="font-semibold text-slate-900">{remaining} ngày</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Đã đạt được</span>
                      <span className="font-semibold text-emerald-700">{formatVND(currentAmount)}</span>
                    </div>
                    <ProgressBar current={currentAmount} goal={goalAmount} />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{progress}% hoàn thành</span>
                      <span>{formatVND(goalAmount)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Lượt ủng hộ</span>
                    <span className="font-semibold text-slate-900">{supportCount}</span>
                  </div>

                  <Button
                    className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setDonateOpen(true)}
                    disabled={!canDonate}
                  >
                    {canDonate ? "Ủng hộ ngay" : "Chiến dịch đã đóng"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto min-h-9 w-full min-w-0 shrink whitespace-normal rounded-full border-emerald-200 px-3 py-2 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                    onClick={handleOpenStatement}
                  >
                    <ReceiptText className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 text-center text-sm leading-snug">
                      Xem bảng chi tiết giao dịch
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-emerald-100 bg-linear-to-br from-emerald-50 via-white to-teal-50 shadow-sm">
              <CardContent className="space-y-3 p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <Calendar className="h-4 w-4" />
                  Thời gian
                </div>
                {location && (
                  <div className="flex items-start gap-2 text-sm text-slate-700">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{location.wardName}, {location.provinceName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <CalendarClock className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Kết thúc: {formatDate(endDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  Trạng thái: {status}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <Dialog open={donateOpen} onOpenChange={setDonateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ủng hộ chiến dịch</DialogTitle>
          </DialogHeader>
          <DonateForm campaignId={campaignId} onPaymentCreated={handlePaymentCreated} />
        </DialogContent>
      </Dialog>

      <QRModal
        open={qrOpen}
        onOpenChange={setQrOpen}
        payment={payment}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
