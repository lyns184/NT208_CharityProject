import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Loader2, MessageCircle, Send } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import {
  createVideoComment,
  getVideoComments,
} from "@/api/video.api"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/utils"

export default function VideoCommentsPanel({
  video,
  open,
  onOpenChange,
  onCommentCreated,
}) {
  const { isAuthenticated } = useAuth()
  const [comments, setComments] = useState([])
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px)")
    const sync = () => setIsDesktop(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  useEffect(() => {
    if (!open || !video?._id) return
    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const response = await getVideoComments(video._id)
        const payload = response.data?.data || response.data
        if (!cancelled) setComments(payload?.comments || [])
      } catch {
        if (!cancelled) setComments([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [open, video?._id])

  const submit = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để bình luận")
      return
    }
    if (!content.trim() || !video?._id) return

    setSubmitting(true)
    try {
      const response = await createVideoComment(video._id, {
        content: content.trim(),
      })
      const comment = response.data?.data || response.data
      setComments((current) => [...current, comment])
      setContent("")
      onCommentCreated?.(video._id)
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể gửi bình luận")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        className="h-[82dvh] w-full gap-0 rounded-t-2xl border-emerald-100 p-0 sm:h-full sm:w-[420px] sm:max-w-[420px] sm:rounded-none"
      >
        <SheetHeader className="border-b border-emerald-100 px-5 py-4">
          <SheetTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-emerald-600" />
            Bình luận ({comments.length})
          </SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : comments.length ? (
            <div className="space-y-5">
              {comments.map((comment) => {
                const author = comment.authorId || {}
                return (
                  <div key={comment._id} className="flex items-start gap-3">
                    <Link to={author._id ? `/profile/${author._id}` : "/videos"}>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={author.avatar} alt={author.name} />
                        <AvatarFallback>
                          {author.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {author.name || "Người dùng"}
                        </p>
                        <span className="shrink-0 text-[11px] text-slate-400">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <MessageCircle className="h-9 w-9 text-emerald-200" />
              <p className="mt-3 text-sm font-medium text-slate-700">
                Chưa có bình luận
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Hãy bắt đầu cuộc trò chuyện đầu tiên.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-emerald-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {isAuthenticated ? (
            <div className="flex items-end gap-2">
              <Textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Viết bình luận..."
                rows={1}
                className="max-h-28 min-h-10 resize-none rounded-lg"
              />
              <Button
                type="button"
                size="icon"
                disabled={submitting || !content.trim()}
                onClick={submit}
                className="shrink-0 bg-emerald-600 hover:bg-emerald-700"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          ) : (
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Link to="/login">Đăng nhập để bình luận</Link>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
