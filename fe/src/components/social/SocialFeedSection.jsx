import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { useSocialPosts } from "@/hooks/useSocialPosts"
import SocialPostCard from "./SocialPostCard"

export default function SocialFeedSection({ feed, title, description, emptyText }) {
  const navigate = useNavigate()
  const { posts, isLoading, page, totalPages, goToPage, nextPage, prevPage } = useSocialPosts({ feed, limit: 6 })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate("/social/create") }>
          <Plus className="mr-2 h-4 w-4" />
          Viết bài
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Đang tải bài viết...
          </CardContent>
        </Card>
      ) : posts.length ? (
        <div className="space-y-5">
          {posts.map((post) => (
            <SocialPostCard key={post._id} post={post} />
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={prevPage}>Trang trước</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={nextPage}>Trang sau</Button>
            </div>
          )}
        </div>
      ) : (
        <Card className="rounded-[28px] border-dashed border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-8 text-center text-sm text-emerald-900/70">
            {emptyText || "Chưa có bài viết nào"}
          </CardContent>
        </Card>
      )}
    </div>
  )
}