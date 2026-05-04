import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import { createSocialComment, getSocialComments } from "@/api/social.api"
import { formatDate, shortHash } from "@/lib/utils"
import { toast } from "sonner"
import { MessageCircle, Send, ArrowRight, PlayCircle } from "lucide-react"
import SocialCommentThread from "./SocialCommentThread"

const TAG_STYLES = {
  ACTIVITY: "bg-emerald-100 text-emerald-700",
  GIVE: "bg-teal-100 text-teal-700",
  HELP: "bg-amber-100 text-amber-700",
}

function MediaPreview({ media = [] }) {
  const list = Array.isArray(media) ? media.filter(Boolean) : []
  if (!list.length) return null

  if (list.length === 1) {
    const item = list[0]
    if (item.type === "video") {
      return (
        <div className="relative overflow-hidden rounded-3xl bg-slate-900">
          <video src={item.url} controls className="h-auto w-full max-h-[480px] object-cover" />
          <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white">
            <PlayCircle className="h-4 w-4" />
            Video
          </div>
        </div>
      )
    }

    return (
      <img
        src={item.url}
        alt="Bài viết"
        className="h-auto w-full max-h-[480px] rounded-3xl object-cover"
      />
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {list.slice(0, 4).map((item, index) => (
        <div key={`${item.url}-${index}`} className="overflow-hidden rounded-2xl bg-slate-100">
          {item.type === "video" ? (
            <video src={item.url} controls className="aspect-square w-full object-cover" />
          ) : (
            <img src={item.url} alt={`Media ${index + 1}`} className="aspect-square w-full object-cover" />
          )}
        </div>
      ))}
    </div>
  )
}

export default function SocialPostCard({ post, compact = false, showComments = false }) {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState("")
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(!!showComments)

  const author = post.authorId || {}
  const campaign = post.campaignId || null
  const tagLabel = useMemo(() => {
    switch (post.tag) {
      case "ACTIVITY":
        return "Hoạt động"
      case "GIVE":
        return "Tặng đồ"
      case "HELP":
        return "Cần hỗ trợ"
      default:
        return post.tag
    }
  }, [post.tag])

  const loadComments = async () => {
    if (!commentsOpen) return
    setIsLoadingComments(true)
    try {
      const res = await getSocialComments(post._id)
      const payload = res.data?.data || res.data
      setComments(Array.isArray(payload?.comments) ? payload.comments : [])
    } catch {
      setComments([])
    } finally {
      setIsLoadingComments(false)
    }
  }

  useEffect(() => {
    if (!commentsOpen) return
    loadComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post._id, commentsOpen])

  const handleComment = async (parentCommentId, content) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để bình luận")
      return
    }

    setIsSubmitting(true)
    try {
      await createSocialComment(post._id, { content, parentCommentId })
      await loadComments()
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể gửi bình luận")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDetail = () => navigate(`/social/${post._id}`)

  if (compact) {
    return (
      <button
        type="button"
        onClick={openDetail}
        className="group w-full overflow-hidden rounded-[28px] border border-emerald-100 bg-white/90 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex items-center gap-3 border-b border-emerald-50 px-4 py-4">
          <Link to={`/profile/${author?._id}`} onClick={(e) => e.stopPropagation()} className="hover:opacity-80 transition-opacity flex-shrink-0">
            <Avatar className="h-11 w-11 ring-2 ring-emerald-100">
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback>{author.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link to={`/profile/${author?._id}`} onClick={(e) => e.stopPropagation()} className="truncate font-semibold text-slate-900 hover:text-emerald-600 transition-colors">
                {author.name || "Người dùng"}
              </Link>
              <Badge className={TAG_STYLES[post.tag] || "bg-slate-100 text-slate-700"}>{tagLabel}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
          </div>
        </div>

        <div className="space-y-3 px-4 py-4">
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-700">
            {post.content}
          </p>
          <MediaPreview media={post.media} />
          <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
            <span>{campaign?.title || "Bài viết chung"}</span>
            <span className="inline-flex items-center gap-1 text-emerald-700">
              Xem chi tiết <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </button>
    )
  }

  return (
    <Card className="overflow-hidden rounded-[32px] border border-emerald-100 bg-white shadow-sm">
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${author?._id}`} className="hover:opacity-80 transition-opacity flex-shrink-0">
              <Avatar className="h-12 w-12 ring-2 ring-emerald-100">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback>{author.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/profile/${author?._id}`} className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors">
                  {author.name || "Người dùng"}
                </Link>
                <Badge className={TAG_STYLES[post.tag] || "bg-slate-100 text-slate-700"}>{tagLabel}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
              {campaign && (
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-xs text-emerald-700"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    navigate(`/campaigns/${campaign._id}`)
                  }}
                >
                  Xem chiến dịch
                </Button>
              )}
            </div>
          </div>

          {post.tag === "ACTIVITY" && (
            <Badge variant="outline" className="border-emerald-200 text-emerald-700">
              Cập nhật chiến dịch
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-slate-700">{post.content}</p>
          <MediaPreview media={post.media} />
        </div>

        {!compact && (
          <div className="space-y-4 rounded-[24px] bg-emerald-50/60 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                  <MessageCircle className="h-4 w-4" />
                  Bình luận
                </div>
                <button
                  type="button"
                  className="text-sm text-emerald-700 underline-offset-2 hover:underline"
                  onClick={() => setCommentsOpen((s) => !s)}
                >
                  {commentsOpen ? "Ẩn bình luận" : "Hiện bình luận"}
                </button>
              </div>

              {commentsOpen && (
                <div className="space-y-4">
                  {isLoadingComments ? (
                    <p className="text-sm text-muted-foreground">Đang tải bình luận...</p>
                  ) : (
                    <SocialCommentThread comments={comments} onReply={handleComment} isAuthenticated={isAuthenticated} />
                  )}

                  {isAuthenticated ? (
                    <div className="space-y-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-emerald-100">
                      <Textarea
                        rows={3}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Viết bình luận..."
                        className="rounded-2xl"
                      />
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-full bg-emerald-600 hover:bg-emerald-700"
                          disabled={isSubmitting || !commentText.trim()}
                          onClick={async () => {
                            await handleComment(null, commentText)
                            setCommentText("")
                          }}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Gửi
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-white p-4 text-sm text-muted-foreground">
                      Vui lòng đăng nhập để bình luận.
                    </div>
                  )}
                </div>
              )}
            </div>
        )}
      </CardContent>
    </Card>
  )
}