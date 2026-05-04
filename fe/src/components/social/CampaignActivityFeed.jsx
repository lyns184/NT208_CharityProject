import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { useSocialPosts } from "@/hooks/useSocialPosts"
import SocialPostCard from "./SocialPostCard"

export default function CampaignActivityFeed({ campaignId, creatorId }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { posts, isLoading } = useSocialPosts({ feed: "campaign", tag: "ACTIVITY", campaignId, limit: 6 })
  const isOwner = user?._id && creatorId && user._id.toString() === creatorId.toString()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Cập nhật hoạt động, tiến độ và câu chuyện từ chủ dự án.
        </p>
        {isOwner && (
          <Button
            className="rounded-full bg-emerald-600 hover:bg-emerald-700"
            onClick={() => navigate(`/social/create?campaignId=${campaignId}&tag=ACTIVITY`) }
          >
            Tạo bài viết
          </Button>
        )}
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Đang tải hoạt động...</CardContent>
        </Card>
      ) : posts.length ? (
        <div className="grid gap-4">
          {posts.map((post) => (
            <SocialPostCard key={post._id} post={post} compact showComments={false} />
          ))}
        </div>
      ) : (
        <Card className="rounded-[28px] border-dashed border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-8 text-center text-sm text-emerald-900/70">
            Chưa có hoạt động nào cho chiến dịch này.
          </CardContent>
        </Card>
      )}
    </div>
  )
}