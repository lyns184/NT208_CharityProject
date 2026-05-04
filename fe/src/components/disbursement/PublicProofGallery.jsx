import { useState, useEffect } from "react"
import { getCampaignProofs } from "@/api/campaign.api"
import { DISBURSEMENT_STATUS } from "@/constants/enums"
import { formatVND } from "@/lib/utils"
import BlockchainLink from "@/components/shared/BlockchainLink"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Receipt } from "lucide-react"

function ProofSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-20 w-20 rounded-md" />
            <Skeleton className="h-20 w-20 rounded-md" />
          </div>
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export default function PublicProofGallery({ campaignId }) {
  const [proofs, setProofs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState("")

  useEffect(() => {
    if (!campaignId) return

    let cancelled = false

    const fetchProofs = async () => {
      setIsLoading(true)
      try {
        const res = await getCampaignProofs(campaignId)
        const payload = res.data?.data ?? res.data
        const data = payload?.disbursements ?? payload
        if (!cancelled) {
          const proofList = Array.isArray(data) ? data : []
          setProofs(proofList)
        }
      } catch {
        // Silently fail — section simply won't render
        if (!cancelled) {
          setProofs([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchProofs()

    return () => {
      cancelled = true
    }
  }, [campaignId])

  const openLightbox = (imageUrl) => {
    setLightboxImage(imageUrl)
    setLightboxOpen(true)
  }

  // Loading state
  if (isLoading) {
    return <ProofSkeleton />
  }

  // Empty — hide the entire section
  if (!proofs.length) return null

  return (
    <>
      {/* Section heading */}
      <div className="flex items-center gap-2 mb-4">
        <Receipt className="h-5 w-5 text-primary" />
        <h3 className="text-base font-semibold text-gray-900">
          Minh chứng sử dụng quỹ
        </h3>
      </div>

      {/* Proof cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {proofs.map((proof) => {
          const images = proof.proofImages ?? proof.images ?? []
          const amount = proof.amount ?? 0
          const reason = proof.reason ?? proof.description ?? ""
          const caption = proof.proofCaption ?? ""
          const reportHash = proof.reportHash ?? proof.txHash ?? null

          return (
            <Card key={proof._id} className="py-0">
              <CardContent className="space-y-3 p-4">
                {/* Amount */}
                <p className="text-sm font-semibold text-emerald-700">
                  {formatVND(amount)}
                </p>

                {/* Reason */}
                {reason && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {reason}
                  </p>
                )}
                {/* Caption */}
                {caption && (
                  <p className="text-sm text-foreground leading-relaxed">
                    {caption}
                  </p>
                )}
                {/* Proof images as thumbnails */}
                {images.filter(Boolean).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {images.filter(Boolean).map((img, idx) => {
                      const src = typeof img === "string" ? img : img?.url ?? img
                      if (!src) return null
                      return (
                        <button
                          key={idx}
                          onClick={() => openLightbox(src)}
                          className="overflow-hidden rounded-md border hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
                          aria-label={`Xem ảnh minh chứng ${idx + 1}`}
                        >
                          <img
                            src={src}
                            alt={`Minh chứng ${idx + 1}`}
                            className="h-20 w-20 object-cover"
                          />
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Blockchain link */}
                {reportHash && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>Blockchain:</span>
                    <BlockchainLink txHash={reportHash} />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Lightbox dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-3xl p-2 sm:p-4">
          <DialogHeader>
            <DialogTitle>Ảnh minh chứng</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            <img
              src={lightboxImage}
              alt="Ảnh minh chứng phóng to"
              className="max-h-[75vh] w-auto rounded-md object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
