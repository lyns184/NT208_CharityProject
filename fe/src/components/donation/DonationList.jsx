import DonationCard from "./DonationCard"
import { Skeleton } from "@/components/ui/skeleton"
import { HandHeart } from "lucide-react"

function DonationSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

export default function DonationList({ donations, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <DonationSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!donations || donations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <HandHeart className="h-12 w-12 mb-3" />
        <p className="text-sm">Chưa có đóng góp nào</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {donations.map((donation) => (
        <DonationCard key={donation._id} donation={donation} />
      ))}
    </div>
  )
}
