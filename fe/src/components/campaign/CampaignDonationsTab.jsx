import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDate, formatVND } from "@/lib/utils"
import BlockchainLink from "@/components/shared/BlockchainLink"
import { Search } from "lucide-react"

export default function CampaignDonationsTab({ donations = [] }) {
  const [search, setSearch] = useState("")
  const [selectedDonation, setSelectedDonation] = useState(null)

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
    <>
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
          <div className="hidden items-center gap-4 border-b border-emerald-50 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground md:grid" style={{ gridTemplateColumns: '25% 25% 25% 25%' }}>
            <span className="text-left align-middle px-6">Người ủng hộ</span>
            <span className="text-center align-middle px-6">Số tiền</span>
            <span className="text-center align-middle px-6">Thời gian</span>
            <span className="text-center align-middle px-6">Thao tác</span>
          </div>

          {filtered.length ? (
            <div className="divide-y divide-emerald-50">
              {filtered.map((donation) => {
                const donorName = donation?.donorId?.name || "Người hảo tâm"
                const donorId = donation?.donorId?._id
                return (
                  <div key={donation._id} className="py-4 text-sm md:grid md:items-center md:gap-4 md:py-4" style={{ gridTemplateColumns: '25% 25% 25% 25%' }}>
                    <div className="hidden md:block">
                      {donorId ? (
                        <Link to={`/profile/${donorId}`} className="px-6 font-semibold text-slate-900 align-middle min-w-0 hover:text-emerald-600 transition-colors">
                          {donorName}
                        </Link>
                      ) : (
                        <span className="px-6 font-semibold text-slate-900 align-middle min-w-0">{donorName}</span>
                      )}
                    </div>
                    <span className="hidden px-6 text-center align-middle font-semibold text-emerald-700 md:block">{formatVND(donation.amount)}</span>
                    <span className="hidden px-6 text-center align-middle text-muted-foreground md:block">{formatDate(donation.createdAt)}</span>
                    <div className="hidden items-center justify-end gap-2 px-6 md:flex">
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          onClick={() => setSelectedDonation(donation)}
                        >
                          Xem chi tiết
                        </Button>
                        <BlockchainLink txHash={donation.blockchainTxHash} />
                      </div>
                    </div>

                    <div className="md:hidden">
                      <div className="flex items-start justify-between gap-3 rounded-2xl border border-emerald-50 bg-emerald-50/30 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          {donorId ? (
                            <Link to={`/profile/${donorId}`} className="block truncate font-semibold text-slate-900 hover:text-emerald-600">
                              {donorName}
                            </Link>
                          ) : (
                            <p className="truncate font-semibold text-slate-900">{donorName}</p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">{formatDate(donation.createdAt)}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0 rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          onClick={() => setSelectedDonation(donation)}
                        >
                          Xem chi tiết
                        </Button>
                      </div>
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

      <Dialog open={Boolean(selectedDonation)} onOpenChange={(value) => !value && setSelectedDonation(null)}>
        <DialogContent className="max-w-xl rounded-[28px] p-6">
          <DialogHeader>
            <DialogTitle>Chi tiết khoản ủng hộ</DialogTitle>
          </DialogHeader>

          {selectedDonation && (
            <div className="space-y-4">
              <div className="rounded-3xl bg-emerald-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Người ủng hộ</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedDonation?.donorId?.name || "Người hảo tâm"}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Số tiền</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-700">{formatVND(selectedDonation.amount)}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Thời gian</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(selectedDonation.createdAt)}</p>
                </div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Giao dịch blockchain</p>
                <div className="mt-2">
                  <BlockchainLink txHash={selectedDonation.blockchainTxHash} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}