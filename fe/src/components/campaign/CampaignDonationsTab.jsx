import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate, formatVND } from "@/lib/utils"
import BlockchainLink from "@/components/shared/BlockchainLink"
import { Search } from "lucide-react"

export default function CampaignDonationsTab({ donations = [] }) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return donations
    return donations.filter((donation) => {
      const donorName = donation?.donorId?.name || "Người hảo tâm"
      const txHash = donation?.blockchainTxHash || ""
      return [donorName, txHash].some((value) => String(value).toLowerCase().includes(q))
    })
  }, [donations, search])

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm người ủng hộ..."
          className="rounded-full border-emerald-100 bg-white pl-9"
        />
      </div>

      <Card className="overflow-hidden rounded-[28px] border-emerald-100 bg-white shadow-sm">
        <CardContent className="p-8">
          <div
            className="grid items-center gap-4 border-b border-emerald-50 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            style={{ gridTemplateColumns: '25% 25% 25% 25%' }}
          >
            <span className="text-left align-middle px-6">Người ủng hộ</span>
            <span className="text-center align-middle px-6">Số tiền</span>
            <span className="text-center align-middle px-6">Thời gian</span>
            <span className="text-center align-middle px-6">txHash</span>
          </div>

          {filtered.length ? (
            <div className="divide-y divide-emerald-50">
              {filtered.map((donation) => {
                const donorName = donation?.donorId?.name || "Người hảo tâm"
                const donorId = donation?.donorId?._id
                return (
                  <div
                    key={donation._id}
                    className="grid items-center gap-4 py-4 text-sm"
                    style={{ gridTemplateColumns: '25% 25% 25% 25%' }}
                  >
                    {donorId ? (
                      <Link to={`/profile/${donorId}`} className="font-semibold text-slate-900 text-left align-middle px-6 min-w-0 hover:text-emerald-600 transition-colors">
                        {donorName}
                      </Link>
                    ) : (
                      <span className="font-semibold text-slate-900 text-left align-middle px-6 min-w-0">{donorName}</span>
                    )}
                    <span className="font-semibold text-emerald-700 text-center align-middle px-6">{formatVND(donation.amount)}</span>
                    <span className="text-muted-foreground text-center align-middle px-6">{formatDate(donation.createdAt)}</span>
                    <div className="flex items-center justify-end gap-2 px-6">
                      <BlockchainLink txHash={donation.blockchainTxHash} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              Chưa có đóng góp phù hợp
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}