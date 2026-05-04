import { useState } from "react"
import { getCampaignSummary } from "@/api/campaign.api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, ChevronUp, ChevronDown } from "lucide-react"
import { toast } from "sonner"

export default function CampaignSummaryAI({ campaignId }) {
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(true)

  const fetchSummary = async () => {
    // If already loaded, just toggle visibility
    if (summary) {
      setIsOpen((prev) => !prev)
      return
    }

    setIsLoading(true)
    try {
      const res = await getCampaignSummary(campaignId)
      setSummary(res.data.summary ?? res.data)
      setIsOpen(true)
    } catch (err) {
      const message =
        err.response?.data?.message || "Không thể tạo tóm tắt AI."
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Trigger button */}
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={fetchSummary}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang phân tích...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            {summary ? (isOpen ? "Ẩn tóm tắt AI" : "Xem tóm tắt AI") : "Xem tóm tắt AI"}
          </>
        )}
      </Button>

      {/* Summary card */}
      {summary && isOpen && (
        <Card>
          <CardContent className="space-y-3 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Sparkles className="h-4 w-4" />
                Tóm tắt AI
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                aria-label="Thu gọn"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {typeof summary === "string" ? summary : summary.text || JSON.stringify(summary)}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
