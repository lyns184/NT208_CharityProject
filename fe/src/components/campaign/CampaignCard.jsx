import { Link } from "react-router-dom"
import { Clock, MapPin, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import StatusBadge from "@/components/shared/StatusBadge"
import ProgressBar from "@/components/shared/ProgressBar"
import { daysRemaining } from "@/lib/utils"

export default function CampaignCard({ campaign }) {
  const remaining = daysRemaining(campaign.endDate)
  const imageUrl =
    typeof campaign.image === "string"
      ? campaign.image
      : campaign.image?.url || null

  return (
    <Link to={`/campaigns/${campaign._id}`} className="block h-full">
      <Card className="flex h-full flex-col overflow-hidden py-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
        {/* Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={campaign.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <span className="text-sm">Không có hình ảnh</span>
            </div>
          )}
          {/* Status badge overlay */}
          <div className="absolute top-2 left-2">
            <StatusBadge status={campaign.status} type="campaign" />
          </div>
        </div>

        {/* Content */}
        <CardContent className="flex flex-1 flex-col p-4 text-center">
          <div className="flex min-h-12 w-full items-center justify-center px-2">
            <h3 className="line-clamp-2 text-base font-semibold leading-tight">
              {campaign.title}
            </h3>
          </div>

          <div className="min-h-12 w-full px-2">
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {campaign.description || ""}
            </p>
          </div>

          {campaign.location && (
            <div className="mt-2 flex min-h-5 items-center justify-center gap-1 text-xs text-emerald-700">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {campaign.location.wardName}, {campaign.location.provinceName}
              </span>
            </div>
          )}

          {/* Progress */}
          <div className="mt-1 w-full space-y-1.5">
            <ProgressBar
              current={campaign.currentBalance ?? campaign.currentAmount ?? 0}
              goal={campaign.goalAmount}
            />
          </div>

          {/* Footer */}
          <div className="mt-auto flex w-full items-center justify-between gap-3 pt-3 text-xs text-muted-foreground">
            <div className="flex min-w-0 items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Còn {remaining} ngày</span>
            </div>
            <div className="flex min-w-0 items-center justify-end gap-1">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate max-w-30">
                {campaign.creatorId?.name || campaign.createdBy?.name || "Ẩn danh"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
