import { useState, useEffect, useCallback, useRef } from "react"
import { getCampaigns } from "@/api/campaign.api"
import { approveCampaign } from "@/api/admin.api"
import CampaignApprovalCard from "@/components/admin/CampaignApprovalCard"
import { CardSkeleton } from "@/components/shared/LoadingSkeleton"
import EmptyState from "@/components/shared/EmptyState"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FileCheck, Inbox, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CAMPAIGN_STATUS } from "@/constants/enums"
import { toast } from "sonner"

export default function CampaignApproval() {
  const [allCampaigns, setAllCampaigns] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("PENDING")
  const [searchQuery, setSearchQuery] = useState("")
  const hasLoadedRef = useRef(false)

  const fetchCampaigns = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true)
    try {
      // Fetch campaigns for each status separately and merge
      const [pendingRes, activeRes, rejectedRes] = await Promise.all([
        getCampaigns({ status: CAMPAIGN_STATUS.PENDING, limit: 200 }),
        getCampaigns({ status: CAMPAIGN_STATUS.ACTIVE + "," + CAMPAIGN_STATUS.GOAL_REACHED, limit: 200 }),
        getCampaigns({ status: CAMPAIGN_STATUS.REJECTED, limit: 200 }),
      ])
      const pendingPayload = pendingRes.data?.data || pendingRes.data
      const activePayload = activeRes.data?.data || activeRes.data
      const rejectedPayload = rejectedRes.data?.data || rejectedRes.data
      const pending = pendingPayload?.campaigns ?? pendingPayload ?? []
      const active = activePayload?.campaigns ?? activePayload ?? []
      const rejected = rejectedPayload?.campaigns ?? rejectedPayload ?? []

      const nextCampaigns = [...pending, ...active, ...rejected]

      setAllCampaigns((prevCampaigns) => {
        if (hasLoadedRef.current) {
          const prevRejectedIds = new Set(
            prevCampaigns
              .filter((campaign) => campaign.status === CAMPAIGN_STATUS.REJECTED)
              .map((campaign) => campaign._id)
          )

          const nextRejectedIds = new Set(
            nextCampaigns
              .filter((campaign) => campaign.status === CAMPAIGN_STATUS.REJECTED)
              .map((campaign) => campaign._id)
          )

          const removedRejectedCount = [...prevRejectedIds].filter(
            (id) => !nextRejectedIds.has(id)
          ).length

          if (removedRejectedCount > 0) {
            if (removedRejectedCount === 1) {
              toast.success("Dự án đã bị chủ sở hữu xóa")
            } else {
              toast.success(`${removedRejectedCount} dự án đã bị chủ sở hữu xóa`)
            }
          }
        }

        return nextCampaigns
      })
      hasLoadedRef.current = true
    } catch {
      toast.error("Không thể tải danh sách chiến dịch")
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCampaigns()
    const intervalId = setInterval(() => fetchCampaigns(true), 15000)

    const handleFocus = () => fetchCampaigns(true)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchCampaigns(true)
      }
    }

    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [fetchCampaigns])

  // Filter by tab
  const filtered = allCampaigns.filter((c) => {
    let ok = false
    if (activeTab === "PENDING") ok = c.status === CAMPAIGN_STATUS.PENDING
    else if (activeTab === "ACTIVE") ok = [CAMPAIGN_STATUS.ACTIVE, CAMPAIGN_STATUS.GOAL_REACHED].includes(c.status)
    else if (activeTab === "REJECTED") ok = c.status === CAMPAIGN_STATUS.REJECTED
    if (!ok) return false

    if (!searchQuery.trim()) return true
    const q = searchQuery.trim().toLowerCase()
    const title = (c.title || "").toLowerCase()
    return title.includes(q)
  })

  // Tab counts
  const countByStatus = (status) => {
    if (status === CAMPAIGN_STATUS.ACTIVE) {
      return allCampaigns.filter((c) =>
        [CAMPAIGN_STATUS.ACTIVE, CAMPAIGN_STATUS.GOAL_REACHED].includes(c.status)
      ).length
    }

    return allCampaigns.filter((c) => c.status === status).length
  }

  // --- Action handlers ---
  const handleApprove = async (campaign) => {
    try {
      await approveCampaign(campaign._id, { status: "ACTIVE" })
      toast.success("Đã duyệt chiến dịch thành công")
      fetchCampaigns()
    } catch {
      toast.error("Duyệt chiến dịch thất bại")
    }
  }

  const handleReject = async (campaign, reason) => {
    try {
      await approveCampaign(campaign._id, {
        status: "REJECTED",
        rejectionReason: reason,
      })
      toast.success("Đã từ chối chiến dịch")
      fetchCampaigns()
    } catch {
      toast.error("Từ chối chiến dịch thất bại")
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-emerald-600" />
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Duyệt chiến dịch
              </h1>
            </div>
            <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
              Xem nhanh trạng thái chiến dịch, mở chi tiết và duyệt hoặc từ chối ngay trong một màn hình.
            </p>
          </div>
        </div>
      </div>

      {/* Header: compact search */}
      <div className="flex items-center justify-end">
        <div className="w-full max-w-xs">
          <Input
            placeholder="Tìm theo tên chiến dịch"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-full"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="rounded-full border border-emerald-100 bg-white p-1 shadow-sm">
          <TabsTrigger value="PENDING">
            Chờ duyệt
            {!isLoading && (
              <span className="ml-1.5 text-xs opacity-70">
                ({countByStatus(CAMPAIGN_STATUS.PENDING)})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="ACTIVE">
            Đã duyệt
            {!isLoading && (
              <span className="ml-1.5 text-xs opacity-70">
                ({countByStatus(CAMPAIGN_STATUS.ACTIVE)})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="REJECTED">
            Từ chối
            {!isLoading && (
              <span className="ml-1.5 text-xs opacity-70">
                ({countByStatus(CAMPAIGN_STATUS.REJECTED)})
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {["PENDING", "ACTIVE", "REJECTED"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue}>
            {isLoading ? (
              <CardSkeleton count={3} />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="Không có chiến dịch"
                description={`Không có chiến dịch nào ở trạng thái "${
                  tabValue === "PENDING"
                    ? "Chờ duyệt"
                    : tabValue === "ACTIVE"
                    ? "Đã duyệt"
                    : "Từ chối"
                }".`}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((campaign) => (
                  <CampaignApprovalCard
                    key={campaign._id}
                    campaign={campaign}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
