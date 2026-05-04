import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import BlockchainLink from "@/components/shared/BlockchainLink"
import { formatVND, formatDate } from "@/lib/utils"
import { User, MessageSquare } from "lucide-react"

export default function DonationCard({ donation }) {
  const {
    donorId,
    amount,
    message,
    createdAt,
    blockchainTxHash,
    blockchainStatus,
  } = donation

  const donorName = donorId?.name || "Người hảo tâm"

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {/* Donor and amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{donorName}</span>
          </div>
          <span className="font-semibold text-primary">
            {formatVND(amount)}
          </span>
        </div>

        <Separator />

        {/* Message */}
        {message && (
          <>
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground italic">{message}</p>
            </div>
            <Separator />
          </>
        )}

        {/* Time and blockchain */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatDate(createdAt)}</span>
          {blockchainTxHash && (
            <BlockchainLink txHash={blockchainTxHash} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
