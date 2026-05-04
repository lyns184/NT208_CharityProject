import { useState, useEffect, useCallback } from "react"
import { getCampaigns } from "@/api/campaign.api"
import { transferDisbursement } from "@/api/admin.api"
import DisbursementManageCard from "@/components/admin/DisbursementManageCard"
import { CardSkeleton } from "@/components/shared/LoadingSkeleton"
import EmptyState from "@/components/shared/EmptyState"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Wallet, Inbox, Search } from "lucide-react"
import { formatVND } from "@/lib/utils"
import { DISBURSEMENT_STATUS } from "@/constants/enums"
import { toast } from "sonner"

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: DISBURSEMENT_STATUS.PENDING_VERIFY, label: "Chờ giải ngân" },
  { value: DISBURSEMENT_STATUS.COMPLETED, label: "Đã giải ngân" },
]

export default function DisbursementManagement() {
  const [campaignGroups, setCampaignGroups] = useState([])
  const [selectedCampaignId, setSelectedCampaignId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  const fetchDisbursements = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getCampaigns({
        status: "ACTIVE,GOAL_REACHED,CLOSED",
        limit: 200,
      })
      const payload = res.data?.data || res.data
      const campaignList = payload?.campaigns ?? payload ?? []

      // Group disbursement requests by campaign
      const groups = []
      for (const campaign of campaignList) {
        const disbursementList = campaign.disbursements ?? campaign.disbursementRequests ?? []
        if (!disbursementList || disbursementList.length === 0) continue

        const requests = disbursementList.map((item) => ({
          ...item,
          campaignId: campaign._id,
          campaignTitle: campaign.title,
        }))

        // sort requests newest first
        requests.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

        groups.push({
          campaignId: campaign._id,
          title: campaign.title,
          totalDisbursed: Number(campaign.disbursedAmount || 0),
          requests,
        })
      }

      // sort campaigns alphabetically
      groups.sort((a, b) => (a.title || "").localeCompare(b.title || ""))

      setCampaignGroups(groups)
      if (!selectedCampaignId && groups.length > 0) setSelectedCampaignId(groups[0].campaignId)
    } catch {
      toast.error("Không thể tải danh sách giải ngân")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDisbursements()
  }, [fetchDisbursements])

  const normalizedStatus = (status) =>
    status === DISBURSEMENT_STATUS.PENDING_TRANSFER
      ? DISBURSEMENT_STATUS.PENDING_VERIFY
      : status

  // derive selected campaign requests filtered by status
  const selectedGroup = campaignGroups.find((g) => g.campaignId === selectedCampaignId) || null
  const requestsForSelected = selectedGroup
    ? selectedGroup.requests.filter((r) =>
        statusFilter === "ALL" ? true : normalizedStatus(r.status) === statusFilter
      )
    : []

  // campaigns list filtered by search
  const visibleCampaigns = campaignGroups.filter((g) =>
    (g.title || "").toLowerCase().includes((searchQuery || "").trim().toLowerCase())
  )

  const handleTransfer = async (disbursement, payload) => {
    try {
      await transferDisbursement(disbursement._id, payload)
      toast.success("Đã chuyển tiền thành công")
      fetchDisbursements()
    } catch {
      toast.error("Chuyển tiền thất bại")
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Wallet className="h-6 w-6 text-emerald-600" />
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Quản lý giải ngân
              </h1>
            </div>
            <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
              Theo dõi yêu cầu, xác nhận chuyển khoản và đối soát minh chứng chi tiêu trên một màn hình.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-[360px]">
              <Input
                placeholder="Tìm tên chiến dịch"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-full"
                icon={<Search className="h-4 w-4 text-slate-400" />}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full rounded-full border-emerald-200 bg-white shadow-sm lg:w-52">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: campaigns list */}
        <div className="col-span-1">
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Danh sách chiến dịch</h3>
            {isLoading ? (
              <CardSkeleton count={4} />
            ) : visibleCampaigns.length === 0 ? (
              <p className="text-sm text-slate-500">Không tìm thấy chiến dịch.</p>
            ) : (
              <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                {visibleCampaigns.map((camp) => {
                  const pendingCount = (camp.requests || []).filter((r) => normalizedStatus(r.status) === DISBURSEMENT_STATUS.PENDING_VERIFY).length
                  return (
                    <button
                      key={camp.campaignId}
                      onClick={() => setSelectedCampaignId(camp.campaignId)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition ${selectedCampaignId === camp.campaignId ? 'border-emerald-300 bg-emerald-50' : 'border-slate-100 bg-white'}`}>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-900">{camp.title}</div>
                        <div className="mt-1 text-xs text-slate-500">Đã giải ngân: {formatVND(camp.totalDisbursed || 0)}</div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="rounded-full bg-emerald-50 px-2 py-0.5 text-sm text-emerald-700">{(camp.requests||[]).length} yêu cầu</div>
                        {pendingCount > 0 && <div className="mt-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">{pendingCount} chờ xử lý</div>}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: selected campaign requests */}
        <div className="col-span-1 lg:col-span-2">
          {isLoading ? (
            <CardSkeleton count={3} />
          ) : !selectedGroup ? (
            <EmptyState icon={Inbox} title="Không có yêu cầu" description="Chọn một chiến dịch để xem các yêu cầu giải ngân." />
          ) : requestsForSelected.length === 0 ? (
            <EmptyState icon={Inbox} title="Không có yêu cầu" description="Không có yêu cầu phù hợp với bộ lọc." />
          ) : (
            <div className="space-y-4">
              {requestsForSelected.map((disbursement) => (
                <DisbursementManageCard key={disbursement._id} disbursement={disbursement} onTransfer={handleTransfer} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}