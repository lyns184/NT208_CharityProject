import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { RefreshCcw, Search, HandCoins } from "lucide-react"
import { toast } from "sonner"
import { getCampaigns } from "@/api/campaign.api"
import { ACCOUNT_TYPE } from "@/constants/enums"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import StatusBadge from "@/components/shared/StatusBadge"

const INITIAL_VISIBLE = 6
const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Đang thực hiện" },
  { value: "GOAL_REACHED", label: "Đã đạt mục tiêu" },
  { value: "CLOSED", label: "Đã kết thúc" },
]

const TAB_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: ACCOUNT_TYPE.ORGANIZATION, label: "Tổ chức" },
  { value: ACCOUNT_TYPE.INDIVIDUAL, label: "Cá nhân" },
]

const SORT_OPTIONS = [
  { value: "latest", label: "Mới nhất" },
  { value: "progress", label: "Tiến độ cao" },
  { value: "raised", label: "Số tiền gây quỹ" },
]

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`
}

function getCampaignImage(campaign) {
  return typeof campaign.image === "string" ? campaign.image : campaign.image?.url || ""
}

function getCampaignAvatar(campaign) {
  return campaign.creatorId?.avatar || campaign.avatar || ""
}

function getDaysLeft(endDate) {
  if (!endDate) return 0
  const now = new Date()
  const end = new Date(endDate)
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  return Math.max(diff, 0)
}

function CampaignCard({ campaign }) {
  const imageUrl = getCampaignImage(campaign)
  const avatarUrl = getCampaignAvatar(campaign)
  const current = Number(campaign.currentBalance ?? campaign.currentAmount ?? 0)
  const goal = Number(campaign.goalAmount || 0)
  const progress = goal > 0 ? Math.min(Math.round((current / goal) * 100), 100) : 0
  const daysLeft = getDaysLeft(campaign.endDate)
  const donationCount = campaign.totalDonations || 0

  return (
    <Link to={`/campaigns/${campaign._id}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={campaign.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-[#6b7280]">
              Không có hình ảnh
            </div>
          )}

          <div className="absolute top-3 left-3">
            <Avatar className="h-11 w-11 border border-white shadow-sm">
              <AvatarImage src={avatarUrl} alt={campaign.creatorId?.name || campaign.title} />
              <AvatarFallback className="bg-[#d1fae5] text-sm font-semibold text-[#10B981]">
                {(campaign.creatorId?.name || campaign.title || "?").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/45 to-transparent px-4 pb-4 pt-10">
            <div className="space-y-2">
              <p className="text-sm font-bold text-white md:text-base">
                {formatMoney(current)}
              </p>
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-[#10B981]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-white">{progress}%</span>
              </div>
            </div>
          </div>

          <div className="absolute right-4 bottom-0 translate-y-1/2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-[#e5e7eb] transition-transform group-hover:scale-105">
              <HandCoins className="h-5 w-5 text-[#10B981]" />
            </div>
          </div>

          <div className="absolute top-3 right-3">
            <StatusBadge status={campaign.status} type="campaign" />
          </div>
        </div>

        <div className="flex flex-1 flex-col space-y-4 p-5 pt-6 pr-14">
          <h3 className="line-clamp-3 text-[15px] font-bold leading-6 text-[#1f2937] transition-colors group-hover:text-[#10B981]">
            {campaign.title}
          </h3>

          <p className="mt-auto text-xs text-[#6b7280]">
            {donationCount} lượt ủng hộ • Còn {daysLeft} ngày
          </p>
        </div>
      </Card>
    </Link>
  )
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("ALL")
  const [status, setStatus] = useState("ACTIVE")
  const [sortBy, setSortBy] = useState("latest")
  const [search, setSearch] = useState("")
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true)
      try {
        const res = await getCampaigns({ status: "ACTIVE,GOAL_REACHED,CLOSED" })
        const payload = res.data?.data ?? res.data
        const data = Array.isArray(payload) ? payload : payload?.campaigns || []
        setCampaigns(data)
      } catch (err) {
        toast.error(err.response?.data?.message || "Không thể tải danh sách chiến dịch")
        setCampaigns([])
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  const filteredCampaigns = useMemo(() => {
    const query = search.trim().toLowerCase()

    const result = campaigns.filter((campaign) => {
      const matchesTab =
        activeTab === "ALL" || campaign.creatorId?.accountType === activeTab
      const matchesStatus = !status || campaign.status === status
      const searchBlob = [campaign.title, campaign.description, campaign.creatorId?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      const matchesSearch = !query || searchBlob.includes(query)
      return matchesTab && matchesStatus && matchesSearch
    })

    const sorted = [...result].sort((a, b) => {
      if (sortBy === "progress") {
        const progressA = Number(a.progress || 0)
        const progressB = Number(b.progress || 0)
        return progressB - progressA
      }

      if (sortBy === "raised") {
        const raisedA = Number(a.currentBalance || 0)
        const raisedB = Number(b.currentBalance || 0)
        return raisedB - raisedA
      }

      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return dateB - dateA
    })

    return sorted
  }, [campaigns, activeTab, status, sortBy, search])

  const visibleCampaigns = filteredCampaigns.slice(0, visibleCount)

  const handleReset = () => {
    setActiveTab("ALL")
    setStatus("ACTIVE")
    setSortBy("latest")
    setSearch("")
    setVisibleCount(INITIAL_VISIBLE)
  }

  return (
    <div className="min-h-screen bg-[#f0fdf4] px-4 py-8 text-[#1f2937]">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#059669] md:text-3xl">
            Danh sách chiến dịch gây quỹ
          </h1>
          <div className="mt-4 flex justify-center">
            <div className="flex flex-wrap items-center justify-center gap-6 border-b border-[#e5e7eb]">
              {TAB_OPTIONS.map((tab) => {
                const active = activeTab === tab.value
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.value)
                      setVisibleCount(INITIAL_VISIBLE)
                    }}
                    className={`pb-3 text-sm font-medium transition-colors ${
                      active
                        ? "border-b-2 border-[#10B981] text-[#10B981]"
                        : "border-b-2 border-transparent text-[#6b7280] hover:text-[#10B981]"
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold uppercase text-[#6b7280]">Trạng thái</Label>
              <Select value={status} onValueChange={(value) => setStatus(value)}>
                <SelectTrigger className="h-11 w-full rounded-lg border-[#e5e7eb] bg-white text-[#1f2937] sm:w-[12.5rem]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold uppercase text-[#6b7280]">Sắp xếp</Label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                <SelectTrigger className="h-11 w-full rounded-lg border-[#e5e7eb] bg-white text-[#1f2937] sm:w-[11.25rem]">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold uppercase text-transparent">Reset</Label>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="h-11 w-11 rounded-lg border-[#e5e7eb] bg-white p-0 text-[#6b7280] hover:bg-[#f3f4f6]"
                aria-label="Reset bộ lọc"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative flex w-full max-w-xl items-center rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 shadow-sm lg:w-[26.25rem]">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setVisibleCount(INITIAL_VISIBLE)
              }}
              placeholder="Tìm kiếm tên chiến dịch"
              className="w-full bg-transparent pr-8 text-sm text-[#1f2937] outline-none placeholder:text-[#6b7280]"
            />
            <Search className="absolute right-4 h-4 w-4 text-[#6b7280]" />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-105 animate-pulse rounded-xl bg-white shadow-sm" />
            ))}
          </div>
        ) : visibleCampaigns.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#e5e7eb] bg-white px-6 py-14 text-center text-sm text-[#6b7280] shadow-sm">
            Không tìm thấy chiến dịch phù hợp.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 auto-rows-fr items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3">
              {visibleCampaigns.map((campaign) => (
                <CampaignCard key={campaign._id} campaign={campaign} />
              ))}
            </div>

            {filteredCampaigns.length > visibleCount && (
              <div className="mt-10 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#10B981] bg-white text-[#10B981] hover:bg-[#10B981] hover:text-white"
                  onClick={() => setVisibleCount((count) => count + INITIAL_VISIBLE)}
                >
                  Xem thêm
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
