import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useCampaigns } from "@/hooks/useCampaigns"
import CampaignGrid from "@/components/campaign/CampaignGrid"
import CampaignFilters from "@/components/campaign/CampaignFilters"
import CampaignCard from "@/components/campaign/CampaignCard"
import { Button } from "@/components/ui/button"
import { Heart, ArrowDown } from "lucide-react"
import { getOrganizers } from "@/api/user.api"
import { ACCOUNT_TYPE, KYC_STATUS } from "@/constants/enums"
import { formatVND, formatPercent } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const DEFAULT_STATUS = "ACTIVE,GOAL_REACHED"

export default function Home() {
  const [organizers, setOrganizers] = useState([])

  const {
    campaigns,
    isLoading,
    search,
    setSearch,
    page,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
  } = useCampaigns({ status: DEFAULT_STATUS })

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await getOrganizers({ limit: 6 })
        const payload = res.data?.data ?? res.data
        const data = Array.isArray(payload) ? payload : payload?.organizers || []
        const approved = data.filter((o) => o.kycStatus === KYC_STATUS.APPROVED)
        setOrganizers(approved)
      } catch (err) {
        setOrganizers([])
      }
    }

    fetchOrgs()
  }, [])

  const scrollToCampaigns = () => {
    document
      .getElementById("campaigns")
      ?.scrollIntoView({ behavior: "smooth" })
  }

  // Build an array of page numbers to render in the pagination bar.
  // Show at most 5 page links centred around the current page.
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, page - Math.floor(maxVisible / 2))
    let end = start + maxVisible - 1

    if (end > totalPages) {
      end = totalPages
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <div className="min-h-screen bg-[#f0fdf4]">
      {/* Hero Banner */}
      <section className="relative h-[520px] sm:h-[600px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1732800577634-f2e5c4d43995?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920')`
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#065f46]/90 to-[#10B981]/80"></div>
        <div className="relative z-10 h-full flex items-center justify-center px-4">
          <div className="text-center max-w-4xl">
            <h1 className="text-white text-5xl sm:text-6xl lg:text-7xl mb-6">
              Kết nối tấm lòng <br />Thắp sáng hy vọng
            </h1>
            <p className="text-[#a7f3d0] text-xl sm:text-2xl mb-8">
              Nền tảng gây quỹ thiện nguyện minh bạch, đáng tin cậy
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-[#10B981] px-8 py-4 text-lg text-white hover:bg-[#059669]">
                <Link to="/campaigns/create">Bắt đầu gây quỹ</Link>
              </Button>
              <Button asChild className="bg-white px-8 py-4 text-lg text-[#059669] hover:bg-[#a7f3d0] hover:text-[#059669]">
                <Link to="/campaigns">Ủng hộ ngay</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Featured Fundraisers */}
      <section className="bg-[#f0fdf4] px-4 py-12 md:py-16">
        <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-br from-[#a7f3d0] to-[#10B981] p-6 md:p-10 shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <h2 className="text-white text-3xl sm:text-4xl">Tổ chức, cá nhân gây quỹ nổi bật</h2>
            <a href="/organizers" className="text-white hover:text-[#065f46] transition">Xem tất cả →</a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {organizers
              .slice()
              .sort((a, b) => (b.totalRaised || 0) - (a.totalRaised || 0))
              .slice(0, 3)
              .map((org, idx) => (
                <div
                  key={org._id || idx}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition flex flex-col items-center text-center"
                >
                  <Avatar className="h-20 w-20 flex-shrink-0">
                    {org.avatar ? (
                      <AvatarImage src={org.avatar} alt={org.name} />
                    ) : (
                      <AvatarFallback className="text-2xl">{org.name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
                    )}
                  </Avatar>

                  {/* Name & Bio Container - Fixed height to prevent card misalignment */}
                  <div className="mt-3 min-h-[80px] flex flex-col items-center justify-start">
                    <h3 className="text-[#065f46] font-semibold text-lg line-clamp-2">{org.name}</h3>
                    
                    {org.bio && (
                      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-1">{org.bio}</p>
                    )}
                  </div>

                  <div className="mt-1 text-center w-full">
                    <p className="text-[#10B981] text-2xl font-semibold">{org.totalRaised ? formatVND(org.totalRaised) : "0 đ"}</p>
                    <p className="text-xs text-[#065f46]">Tổng số tiền quyên góp</p>
                  </div>

                  <a
                    href={`/profile/${org._id}`}
                    className="mt-5 w-full rounded-lg border border-[#10B981] bg-white py-2 text-center text-sm font-medium text-[#10B981] transition hover:bg-[#10B981] hover:text-white"
                  >
                    Xem chi tiết
                  </a>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Section 2: Statistics */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[#059669] text-3xl sm:text-4xl text-center mb-12">
            Đồng hành cùng cộng đồng thiện nguyện minh bạch từ năm 2025
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Network Diagram */}
            <div className="relative h-80 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-[#10B981] rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-4xl">🤝</span>
                </div>
              </div>
              <div className="absolute top-0 left-1/4 w-20 h-20 bg-[#a7f3d0] rounded-full flex items-center justify-center">
                <span className="text-[#059669] text-2xl">💚</span>
              </div>
              <div className="absolute top-0 right-1/4 w-20 h-20 bg-[#a7f3d0] rounded-full flex items-center justify-center">
                <span className="text-[#059669] text-2xl">🏆</span>
              </div>
              <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-[#a7f3d0] rounded-full flex items-center justify-center">
                <span className="text-[#059669] text-2xl">📊</span>
              </div>
              <div className="absolute bottom-0 right-1/4 w-20 h-20 bg-[#a7f3d0] rounded-full flex items-center justify-center">
                <span className="text-[#059669] text-2xl">🌟</span>
              </div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 bg-[#10B981] rounded-full flex items-center justify-center">
                <span className="text-white text-xl">✓</span>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-16 bg-[#10B981] rounded-full flex items-center justify-center">
                <span className="text-white text-xl">✓</span>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { number: "50,000+", label: "Nhà hào tâm" },
                { number: "1,200+", label: "Tổ chức từ thiện" },
                { number: "500+ tỷ đồng", label: "Quyên góp" },
                { number: "3,500+", label: "Chiến dịch thành công" },
                { number: "100%", label: "Minh bạch" },
                { number: "24/7", label: "Hỗ trợ" }
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-[#059669] text-4xl font-semibold mb-2">{stat.number}</p>
                  <p className="text-[#10B981]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Organization Campaigns */}
      <section className="py-16 px-4 bg-[#f0fdf4]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <h2 className="text-[#059669] text-3xl">Chiến dịch của Tổ chức</h2>
            <a href="/campaigns" className="text-[#10B981] hover:text-[#059669] transition">Xem tất cả →</a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {campaigns
              .filter((c) => c.creatorId?.accountType === ACCOUNT_TYPE.ORGANIZATION)
              .slice(0, 3)
              .map((campaign) => (
                <CampaignCard key={campaign._id} campaign={campaign} />
              ))}
          </div>

        </div>
      </section>

      {/* Section 4: Individual Campaigns */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <h2 className="text-[#059669] text-3xl">Chiến dịch của Cá nhân</h2>
            <a href="/campaigns" className="text-[#10B981] hover:text-[#059669] transition">Xem tất cả →</a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {campaigns
              .filter((c) => c.creatorId?.accountType !== ACCOUNT_TYPE.ORGANIZATION)
              .slice(0, 3)
              .map((campaign) => (
                <CampaignCard key={campaign._id} campaign={campaign} />
              ))}
          </div>

        </div>
      </section>

      {/* Footer is now rendered globally via MainLayout */}
    </div>
  )
}
