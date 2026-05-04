import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { getSocialPost } from "@/api/social.api"
import SocialPostCard from "@/components/social/SocialPostCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function SocialPostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const res = await getSocialPost(id)
        const payload = res.data?.data || res.data
        if (!cancelled) setPost(payload?.post || null)
      } catch (err) {
        toast.error(err.response?.data?.message || "Không thể tải bài viết")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" className="mb-4 -ml-2">
        <Link to="/social">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Link>
      </Button>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Đang tải bài viết...</CardContent>
        </Card>
      ) : post ? (
        <SocialPostCard post={post} showComments />
      ) : (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Bài viết không tồn tại</CardContent>
        </Card>
      )}
    </div>
  )
}