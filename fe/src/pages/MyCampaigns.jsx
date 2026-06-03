import { useState, useEffect, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getMyCampaigns } from "@/api/user.api"
import { closeCampaign, updateCampaign, deleteCampaign } from "@/api/campaign.api"
import { useAuth } from "@/hooks/useAuth"
import StatusBadge from "@/components/shared/StatusBadge"
import ProgressBar from "@/components/shared/ProgressBar"
import CampaignForm from "@/components/campaign/CampaignForm"
import EmptyState from "@/components/shared/EmptyState"
import { CardSkeleton } from "@/components/shared/LoadingSkeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CAMPAIGN_STATUS } from "@/constants/enums"
import { FolderHeart, Pencil, XCircle, Banknote, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"

const CAMPAIGN_TABS = [
  { value: "all", label: "Tất cả" },
  { value: CAMPAIGN_STATUS.ACTIVE, label: "Đang hoạt động" },
  { value: CAMPAIGN_STATUS.PENDING, label: "Chờ duyệt" },
  { value: CAMPAIGN_STATUS.REJECTED, label: "Bị từ chối" },
  { value: CAMPAIGN_STATUS.CLOSED, label: "Đã đóng" },
]

export default function MyCampaigns() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [closingId, setClosingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [editCampaign, setEditCampaign] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [tabValue, setTabValue] = useState("all")

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMyCampaigns()
      const payload = res.data?.data || res.data
      setCampaigns(Array.isArray(payload) ? payload : payload.campaigns || [])
    } catch (err) {
      const msg =
        err.response?.data?.message || "Không thể tải danh sách chiến dịch"
      toast.error(msg)
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const handleClose = async (id) => {
    setClosingId(id)
    try {
      await closeCampaign(id)
      toast.success("Đã đóng chiến dịch thành công")
      fetchCampaigns()
    } catch (err) {
      const msg =
        err.response?.data?.message || "Đóng chiến dịch thất bại"
      toast.error(msg)
    } finally {
      setClosingId(null)
    }
  }

  const handleEdit = (campaign) => {
    setEditCampaign(campaign)
    setEditDialogOpen(true)
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await deleteCampaign(id)
      toast.success("Đã xóa chiến dịch bị từ chối")
      fetchCampaigns()
    } catch (err) {
      const msg =
        err.response?.data?.message || "Xóa chiến dịch thất bại"
      toast.error(msg)
    } finally {
      setDeletingId(null)
    }
  }

  const handleUpdate = async (data) => {
    if (!editCampaign) return
    setUpdateLoading(true)
    try {
      const id = editCampaign._id || editCampaign.id
      await updateCampaign(id, data)
      toast.success("Cập nhật chiến dịch thành công")
      setEditDialogOpen(false)
      setEditCampaign(null)
      fetchCampaigns()
    } catch (err) {
      const msg =
        err.response?.data?.message || "Cập nhật chiến dịch thất bại"
      toast.error(msg)
    } finally {
      setUpdateLoading(false)
    }
  }

  const filterByStatus = (status) => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return campaigns.filter((campaign) => {
      const matchesStatus = !status || campaign.status === status
      const title = String(campaign.title || "").toLowerCase()
      const description = String(campaign.description || "").toLowerCase()
      const matchesSearch =
        !normalizedQuery ||
        title.includes(normalizedQuery) ||
        description.includes(normalizedQuery)

      return matchesStatus && matchesSearch
    })
  }

  const renderCampaignCard = (campaign) => {
    const id = campaign._id || campaign.id
    const imageUrl =
      typeof campaign.image === "string"
        ? campaign.image
        : campaign.image?.url || null

    const progressValue = campaign.goalAmount
      ? Math.round(
          ((campaign.currentBalance ?? campaign.currentAmount ?? 0) /
            campaign.goalAmount) *
            100
        )
      : 0

    return (
      <Card key={id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* Campaign Image */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={campaign.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <FolderHeart className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute left-3 top-3">
            <StatusBadge status={campaign.status} type="campaign" />
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col items-center space-y-3 p-4 text-center">
          {/* Title */}
          <div className="flex min-h-12 w-full items-center justify-center px-2">
            <Link
              to={`/campaigns/${id}`}
              className="line-clamp-2 text-base font-semibold text-slate-900 hover:underline"
            >
              {campaign.title}
            </Link>
          </div>

          {/* Progress */}
          <div className="w-full space-y-1">
            <ProgressBar
              current={campaign.currentBalance ?? campaign.currentAmount ?? 0}
              goal={campaign.goalAmount || 0}
              className="text-xs"
            />

            <div className="text-xs text-slate-500">
              {progressValue}% hoàn thành
            </div>
          </div>

          <div className="w-full">
            {campaign.status === CAMPAIGN_STATUS.REJECTED && campaign.rejectionReason ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                Lý do từ chối: {campaign.rejectionReason}
              </div>
            ) : null}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
            {/* Edit button for ACTIVE, PENDING and REJECTED */}
            {(campaign.status === CAMPAIGN_STATUS.ACTIVE ||
              campaign.status === CAMPAIGN_STATUS.PENDING ||
              campaign.status === CAMPAIGN_STATUS.REJECTED) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(campaign)}
                className="rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                {campaign.status === CAMPAIGN_STATUS.REJECTED ? "Chỉnh sửa và nộp lại" : "Chỉnh sửa"}
              </Button>
            )}

            {/* Close button for ACTIVE */}
            {campaign.status === CAMPAIGN_STATUS.ACTIVE && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-destructive hover:text-destructive"
                    disabled={closingId === id}
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                    Đóng chiến dịch
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Đóng chiến dịch?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn đóng chiến dịch này? Hành động này
                      không thể hoàn tác. Các khoản đóng góp sẽ được xử lý theo
                      chính sách của nền tảng.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleClose(id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Đóng chiến dịch
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Delete button for REJECTED */}
            {campaign.status === CAMPAIGN_STATUS.REJECTED && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-destructive hover:text-destructive "
                    disabled={deletingId === id}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Xóa dự án
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xóa dự án bị từ chối?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn xóa dự án này? Hành động này không
                      thể hoàn tác.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(id)}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Xóa dự án
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

          </div>

          {/* Disburse button for eligible statuses */}
          {[CAMPAIGN_STATUS.ACTIVE, CAMPAIGN_STATUS.GOAL_REACHED, CAMPAIGN_STATUS.CLOSED].includes(
            campaign.status
          ) && (
            <div className="flex justify-center pt-0.5">
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate(`/my-campaigns/${id}/disburse`)}
                className="rounded-full bg-slate-900 text-white hover:bg-slate-800"
              >
                <Banknote className="mr-1.5 h-3.5 w-3.5" />
                Yêu cầu giải ngân
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderTabContent = (status) => {
    const filtered = filterByStatus(status)

    if (loading) {
      return <CardSkeleton count={3} />
    }

    if (filtered.length === 0) {
      return (
        <EmptyState
          icon={FolderHeart}
          title="Không có chiến dịch"
          description={
            searchQuery.trim()
              ? "Không tìm thấy chiến dịch phù hợp với từ khóa hiện tại."
              : status
                ? "Không có chiến dịch nào trong trạng thái này."
                : "Bạn chưa tạo chiến dịch nào. Hãy bắt đầu tạo chiến dịch đầu tiên!"
          }
          action={
            !status && !isAdmin && (
              <Button
                onClick={() => navigate("/campaigns/create")}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Tạo chiến dịch
              </Button>
            )
          }
        />
      )
    }

    return (
      <div className="grid grid-cols-1 auto-rows-fr items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(renderCampaignCard)}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Chiến dịch của tôi
          </h1>
          <p className="mt-1 text-muted-foreground">
            Quản lý các chiến dịch gây quỹ bạn đã khởi tạo. Theo dõi tiến độ và tác động thực tế từ cộng đồng.
          </p>
        </div>
        {!isAdmin && (
          <Button
            onClick={() => navigate("/campaigns/create")}
            className="rounded-full bg-emerald-600 px-5 text-white shadow-md shadow-emerald-200"
          >
            Tạo chiến dịch mới
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm chiến dịch theo tên hoặc mô tả..."
            className="h-12 rounded-full border-emerald-200 bg-emerald-50 pl-11 pr-4 text-sm focus-visible:border-emerald-400 focus-visible:ring-emerald-200"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="sm:hidden">
        <Select value={tabValue} onValueChange={setTabValue}>
          <SelectTrigger className="h-11 w-full rounded-full border-slate-200 bg-white">
            <SelectValue placeholder="Chọn trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {CAMPAIGN_TABS.map((tab) => (
              <SelectItem key={tab.value} value={tab.value}>
                {tab.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={tabValue} onValueChange={setTabValue}>
        <TabsList className="hidden w-full justify-start rounded-full border border-slate-100 bg-white p-1 shadow-sm sm:flex sm:w-auto">
          {CAMPAIGN_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-full px-4 py-1 text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {renderTabContent(null)}
        </TabsContent>

        <TabsContent value={CAMPAIGN_STATUS.ACTIVE} className="mt-6">
          {renderTabContent(CAMPAIGN_STATUS.ACTIVE)}
        </TabsContent>

        <TabsContent value={CAMPAIGN_STATUS.PENDING} className="mt-6">
          {renderTabContent(CAMPAIGN_STATUS.PENDING)}
        </TabsContent>

        <TabsContent value={CAMPAIGN_STATUS.REJECTED} className="mt-6">
          {renderTabContent(CAMPAIGN_STATUS.REJECTED)}
        </TabsContent>

        <TabsContent value={CAMPAIGN_STATUS.CLOSED} className="mt-6">
          {renderTabContent(CAMPAIGN_STATUS.CLOSED)}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chiến dịch</DialogTitle>
          </DialogHeader>
          {editCampaign && (
            <CampaignForm
              initialData={editCampaign}
              onSubmit={handleUpdate}
              isLoading={updateLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
