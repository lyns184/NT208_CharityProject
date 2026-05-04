import { useMemo } from "react"
import { useSearchParams, Link } from "react-router-dom"
import SocialComposer from "@/components/social/SocialComposer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function SocialPostCreate() {
  const [params] = useSearchParams()
  const initialTag = params.get("tag") || "ACTIVITY"
  const initialCampaignId = params.get("campaignId") || ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" className="mb-6 -ml-2 text-slate-600 hover:text-slate-900">
          <Link to="/social" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Chia sẻ bài viết</h1>
          <p className="mt-2 text-muted-foreground">Kể những câu chuyện tử tế và truyền cảm hứng cho cộng đồng</p>
        </div>

        <SocialComposer initialTag={initialTag} initialCampaignId={initialCampaignId} />
      </div>
    </div>
  )
}