import { FolderSearch } from "lucide-react"
import CampaignCard from "@/components/campaign/CampaignCard"
import { CardSkeleton } from "@/components/shared/LoadingSkeleton"
import EmptyState from "@/components/shared/EmptyState"

export default function CampaignGrid({
  campaigns = [],
  loading = false,
  emptyMessage = "Không tìm thấy chiến dịch nào.",
}) {
  if (loading) {
    return <CardSkeleton count={6} />
  }

  if (!campaigns.length) {
    return (
      <EmptyState
        icon={FolderSearch}
        title={emptyMessage}
        description="Thử thay đổi bộ lọc hoặc quay lại sau."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 auto-rows-fr items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign._id} campaign={campaign} />
      ))}
    </div>
  )
}
