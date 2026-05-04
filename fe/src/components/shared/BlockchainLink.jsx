import { ExternalLink } from "lucide-react"
import { cn, shortHash, getEtherscanUrl } from "@/lib/utils"
import CopyToClipboardButton from "@/components/shared/CopyToClipboardButton"

export default function BlockchainLink({ txHash, className }) {
  if (!txHash) return null

  const url = getEtherscanUrl(txHash)

  return (
    <div className={cn("inline-flex items-center gap-1.5 min-w-0", className)}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-mono text-sm text-primary hover:underline align-middle min-w-0"
      >
        <span className="overflow-hidden whitespace-nowrap truncate" style={{ maxWidth: '10rem', display: 'inline-block' }}>
          {shortHash(txHash)}
        </span>
        <ExternalLink className="h-3.5 w-3.5 align-middle flex-shrink-0" />
      </a>
      <CopyToClipboardButton text={txHash} className="align-middle flex-shrink-0" />
    </div>
  )
}
