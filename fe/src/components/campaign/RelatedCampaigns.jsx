import { useState, useEffect } from "react"
import { getRelatedCampaigns } from "@/api/campaign.api"
import CampaignCard from "@/components/campaign/CampaignCard"
import { CardSkeleton } from "@/components/shared/LoadingSkeleton"

export default function RelatedCampaigns({ campaignId }) {
  const [campaigns, setCampaigns] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!campaignId) return

    let cancelled = false

    const fetchRelated = async () => {
      setIsLoading(true)
      try {
        const res = await getRelatedCampaigns(campaignId)
        const data = res.data.campaigns ?? res.data
        if (!cancelled) {
          setCampaigns(Array.isArray(data) ? data.slice(0, 3) : [])
        }
      } catch {
        // Silently fail — section simply won't render
        if (!cancelled) {
          setCampaigns([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchRelated()

    return () => {
      cancelled = true
    }
  }, [campaignId])

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Chiến dịch liên quan
        </h2>
        <CardSkeleton count={3} />
      </div>
    )
  }

  // Empty — hide the entire section
  if (!campaigns.length) return null

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Chiến dịch liên quan
      </h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign._id} campaign={campaign} />
        ))}
      </div>
    </div>
  )
}
