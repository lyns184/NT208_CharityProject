import { useState, useEffect, useCallback } from "react"
import { getKYCList, approveKYC } from "@/api/admin.api"
import KYCReviewCard from "@/components/admin/KYCReviewCard"
import { CardSkeleton } from "@/components/shared/LoadingSkeleton"
import EmptyState from "@/components/shared/EmptyState"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { UserCheck, Inbox, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { KYC_STATUS } from "@/constants/enums"
import { toast } from "sonner"

export default function KYCManagement() {
  const [allKYC, setAllKYC] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("PENDING")
  const [searchQuery, setSearchQuery] = useState("")

  const fetchKYC = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getKYCList()
      const payload = res.data?.data || res.data
      setAllKYC(payload?.users ?? payload ?? [])
    } catch {
      toast.error("Không thể tải danh sách KYC")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKYC()
  }, [fetchKYC])

  // Filter by tab status
  const filtered = allKYC.filter((kyc) => {
    const status = kyc.kycStatus ?? kyc.status
    if (status !== activeTab) return false

    if (!searchQuery.trim()) return true
    const q = searchQuery.trim().toLowerCase()
    const user = kyc.user ?? kyc
    const name = (user.name || "").toLowerCase()
    const email = (user.email || "").toLowerCase()
    return name.includes(q) || email.includes(q)
  })

  // --- Action handlers ---
  const handleApprove = async (kyc) => {
    const userId = kyc.user?._id ?? kyc._id
    try {
      await approveKYC(userId, { status: "APPROVED" })
      toast.success("Đã duyệt KYC thành công")
      fetchKYC()
    } catch {
      toast.error("Duyệt KYC thất bại")
    }
  }

  const handleReject = async (kyc, reason) => {
    const userId = kyc.user?._id ?? kyc._id
    try {
      await approveKYC(userId, {
        status: "REJECTED",
        rejectionReason: reason,
      })
      toast.success("Đã từ chối KYC")
      fetchKYC()
    } catch {
      toast.error("Từ chối KYC thất bại")
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-emerald-600" />
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Quản lý KYC
              </h1>
            </div>
            <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
              Duyệt hồ sơ cá nhân và tổ chức.
            </p>
          </div>
        </div>
      </div>

      {/* Header: small search input */}
      <div className="flex items-center justify-end">
        <div className="w-full max-w-xs">
          <Input
            placeholder="Tìm theo tên hoặc email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-full"
            icon={<Search className="h-4 w-4 text-slate-400" />}
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
                (
                {
                  allKYC.filter(
                    (k) =>
                      (k.kycStatus ?? k.status) === KYC_STATUS.PENDING
                  ).length
                }
                )
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="APPROVED">
            Đã duyệt
            {!isLoading && (
              <span className="ml-1.5 text-xs opacity-70">
                (
                {
                  allKYC.filter(
                    (k) =>
                      (k.kycStatus ?? k.status) === KYC_STATUS.APPROVED
                  ).length
                }
                )
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="REJECTED">
            Từ chối
            {!isLoading && (
              <span className="ml-1.5 text-xs opacity-70">
                (
                {
                  allKYC.filter(
                    (k) =>
                      (k.kycStatus ?? k.status) === KYC_STATUS.REJECTED
                  ).length
                }
                )
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* All tabs share the same render pattern */}
        {["PENDING", "APPROVED", "REJECTED"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue}>
            {isLoading ? (
              <CardSkeleton count={3} />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="Không có dữ liệu"
                description={`Không có KYC nào ở trạng thái "${
                  tabValue === "PENDING"
                    ? "Chờ duyệt"
                    : tabValue === "APPROVED"
                    ? "Đã duyệt"
                    : "Từ chối"
                }".`}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((kyc) => (
                  <KYCReviewCard
                    key={kyc._id ?? kyc.user?._id}
                    kyc={kyc}
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
