import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDate, formatVND } from "@/lib/utils"

export default function CampaignReportsTab({ disbursements = [] }) {
  const [selected, setSelected] = useState(null)
  const open = Boolean(selected)

  return (
    <>
      <div className="space-y-4">
        <Card className="overflow-hidden rounded-[28px] border-emerald-100 bg-white shadow-sm">
          <CardContent className="p-8">
            <div className="hidden items-center gap-4 border-b border-emerald-50 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground md:grid" style={{ gridTemplateColumns: '25% 25% 25% 25%' }}>
              <span className="text-left align-middle px-6">Nội dung chi</span>
              <span className="text-center align-middle px-6">Thời gian tạo</span>
              <span className="text-center align-middle px-6">Tổng tiền chi</span>
              <span className="text-center align-middle px-6" />
            </div>

            {disbursements.length ? (
              <div className="divide-y divide-emerald-50">
                {disbursements.map((item) => (
                  <div key={item._id} className="py-4 text-sm md:grid md:items-center md:gap-4 md:py-4" style={{ gridTemplateColumns: '25% 25% 25% 25%' }}>
                    <div className="hidden md:block min-w-0 px-6">
                      <p className="text-left align-middle line-clamp-1 font-semibold text-slate-900">{item.reason}</p>
                    </div>
                    <span className="hidden px-6 text-center align-middle text-muted-foreground md:block">{formatDate(item.createdAt)}</span>
                    <span className="hidden px-6 text-center align-middle font-semibold text-emerald-700 md:block">{formatVND(item.amount)}</span>
                    <div className="hidden justify-end px-6 md:flex">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        onClick={() => setSelected(item)}
                      >
                        Xem chi tiết
                      </Button>
                    </div>

                    <div className="md:hidden">
                      <div className="flex items-start justify-between gap-3 rounded-2xl border border-emerald-50 bg-emerald-50/30 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-900">{item.reason}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0 rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          onClick={() => setSelected(item)}
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                Chưa có báo cáo chi tiêu
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={(value) => !value && setSelected(null)}>
        <DialogContent className="max-w-6xl rounded-[28px] p-6">
          <DialogHeader>
            <DialogTitle>Chi tiết khoản chi</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="rounded-3xl bg-emerald-50/60 p-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Nội dung chi</p>
                <p className="text-base leading-7 text-slate-800">{selected.reason}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Thời gian tạo</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(selected.createdAt)}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Tổng tiền chi</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-700">{formatVND(selected.amount)}</p>
                </div>
              </div>

              {selected.proofImages?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Hình ảnh chứng từ</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selected.proofImages.filter(Boolean).map((src, index) => (
                      <img
                        key={`${src}-${index}`}
                        src={typeof src === "string" ? src : src?.url}
                        alt={`Chứng từ ${index + 1}`}
                        className="h-72 w-full rounded-3xl object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}