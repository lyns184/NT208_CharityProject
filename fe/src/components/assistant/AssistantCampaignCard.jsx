import { Link } from "react-router-dom"
import { ArrowRight, MapPin } from "lucide-react"
import { formatVND } from "@/lib/utils"

export default function AssistantCampaignCard({ campaign, onNavigate }) {
  const progress = Math.min(Math.max(Number(campaign.progress || 0), 0), 100)

  return (
    <div className="overflow-hidden rounded-lg border border-emerald-100 bg-white">
      <div className="flex gap-3 p-3">
        {campaign.image && (
          <img
            src={campaign.image}
            alt=""
            className="h-16 w-20 shrink-0 rounded-md object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">
            {campaign.title}
          </p>
          {campaign.location && (
            <div className="mt-1 flex items-start gap-1 text-xs text-slate-500">
              <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
              <span className="line-clamp-1">
                {campaign.location.wardName}, {campaign.location.provinceName}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 border-t border-emerald-50 px-3 py-2.5">
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-medium text-emerald-700">{progress}% mục tiêu</span>
          <span className="truncate text-slate-500">
            Còn thiếu {formatVND(campaign.remainingAmount)}
          </span>
        </div>
        <Link
          to={campaign.url || `/campaigns/${campaign.id}`}
          onClick={onNavigate}
          className="flex items-center justify-end gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Xem chiến dịch
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
