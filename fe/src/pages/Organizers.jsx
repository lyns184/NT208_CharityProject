import { useMemo, useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search } from "lucide-react"
import { toast } from "sonner"
import { getOrganizers } from "@/api/user.api"
import { ACCOUNT_TYPE, KYC_STATUS } from "@/constants/enums"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function OrganizerCardSkeleton({ count = 6 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="my-4 border-b border-[#e5e7eb]" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="mt-4 h-4 w-24" />
    </div>
  ))
}

export default function Organizers() {
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(ACCOUNT_TYPE.ORGANIZATION)
  const [search, setSearch] = useState("")
  const [visibleCount, setVisibleCount] = useState(6)

  useEffect(() => {
    const fetchOrganizers = async () => {
      setLoading(true)
      try {
        const res = await getOrganizers({ limit: 100 })
        const payload = res.data?.data ?? res.data
        const data = Array.isArray(payload) ? payload : payload?.organizers || []
        setOrganizers(data.filter((org) => org.kycStatus === KYC_STATUS.APPROVED))
      } catch (err) {
        toast.error(err.response?.data?.message || "Không thể tải danh sách tổ chức")
        setOrganizers([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizers()
  }, [])

  const filteredOrganizers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return organizers.filter((org) => {
      const matchesTab = activeTab === "ALL" || org.accountType === activeTab
      const username = org.email ? `@${org.email.split("@")[0]}` : ""
      const haystack = [org.name, username, org.bio].filter(Boolean).join(" ").toLowerCase()
      const matchesSearch = !query || haystack.includes(query)
      return matchesTab && matchesSearch
    })
  }, [organizers, activeTab, search])

  const visibleOrganizers = filteredOrganizers.slice(0, visibleCount)

  const formatJoinedDate = (dateValue) => {
    if (!dateValue) return ""
    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) return ""
    return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`
  }

  const getUsername = (org) => {
    if (org.email) return `@${org.email.split("@")[0]}`
    return `@${(org.name || "user").toLowerCase().replace(/\s+/g, "")}`
  }

  return (
    <div className="min-h-screen bg-[#f0fdf4] px-4 py-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative mb-10 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
          <div className="pointer-events-none absolute left-4 top-4 hidden h-full w-full text-[#d1fae5] sm:block">
            <span className="absolute left-0 top-0 text-2xl leading-none">•</span>
            <span className="absolute left-0 top-8 text-2xl leading-none">•</span>
            <span className="absolute left-0 top-16 text-2xl leading-none">•</span>
            <span className="absolute right-6 top-6 text-2xl leading-none">•</span>
            <span className="absolute right-12 top-12 text-2xl leading-none">•</span>
            <span className="absolute right-0 top-20 text-2xl leading-none">•</span>
          </div>

          <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 shadow-sm">
              <Search className="h-5 w-5 text-[#9ca3af]" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setVisibleCount(6)
                }}
                placeholder="Tìm kiếm theo tên cá nhân hoặc tổ chức..."
                className="w-full bg-transparent text-sm text-[#1f2937] outline-none placeholder:text-[#9ca3af]"
              />
            </div>

            <Button
              type="button"
              className="h-12 w-full rounded-full bg-[#10B981] px-6 text-white hover:bg-[#059669] sm:w-auto sm:min-w-35"
              onClick={() => setVisibleCount(6)}
            >
              Tìm kiếm
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-[#e5e7eb]">
          {[
            { key: ACCOUNT_TYPE.ORGANIZATION, label: "Tổ chức" },
            { key: ACCOUNT_TYPE.INDIVIDUAL, label: "Cá nhân" },
          ].map((tab) => {
            const active = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key)
                  setVisibleCount(6)
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

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <OrganizerCardSkeleton count={6} />
          </div>
        ) : visibleOrganizers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#e5e7eb] bg-white px-6 py-12 text-center text-sm text-[#6b7280] shadow-sm">
            Không tìm thấy kết quả phù hợp.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleOrganizers.map((org) => (
                <Card
                  key={org._id || org.id}
                  className="h-full rounded-lg border border-[#e5e7eb] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <CardContent className="p-4">
                    <Link to={`/profile/${org._id}`} className="block">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12 shrink-0">
                          <AvatarImage src={org.avatar || org.portrait} alt={org.name} />
                          <AvatarFallback className="bg-[#d1fae5] text-sm font-semibold text-[#10B981]">
                            {org.name?.charAt(0)?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold text-[#1f2937]">
                            {org.name}
                          </h3>
                          <p className="truncate text-sm text-[#6b7280]">{getUsername(org)}</p>
                        </div>
                      </div>
                    </Link>

                    <div className="my-4 border-b border-[#e5e7eb]" />

                    <div className="space-y-1 text-sm text-[#1f2937]">
                      <p>
                        Số tiền gây quỹ: <span className="font-semibold">{org.totalRaised ? `${Number(org.totalRaised).toLocaleString("vi-VN")} VND` : "0 VND"}</span>
                      </p>
                      <p>
                        Tham gia từ: <span className="font-medium">{formatJoinedDate(org.createdAt) || "--/----"}</span>
                      </p>
                      <p className="line-clamp-2 text-[#6b7280]">
                        {org.bio || "Chưa có mô tả về bản thân."}
                      </p>
                    </div>

                    <Link
                      to={`/profile/${org._id}`}
                      className="mt-4 inline-block text-sm font-medium text-[#1f2937] transition hover:text-[#10B981]"
                    >
                      Xem chi tiết &gt;
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredOrganizers.length > visibleCount && (
              <div className="mt-8 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#10B981] bg-white text-[#10B981] hover:bg-[#10B981] hover:text-white"
                  onClick={() => setVisibleCount((count) => count + 6)}
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
