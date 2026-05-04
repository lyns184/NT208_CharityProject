import { useState } from "react"
import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/utils"
import { CornerDownRight, Send } from "lucide-react"

export function buildCommentTree(comments = []) {
  const byParent = new Map()
  comments.forEach((comment) => {
    const parentKey = comment.parentCommentId || null
    if (!byParent.has(parentKey)) byParent.set(parentKey, [])
    byParent.get(parentKey).push({ ...comment, children: [] })
  })

  const attachChildren = (nodes) => {
    return nodes.map((node) => {
      const children = byParent.get(node._id) || []
      return { ...node, children: attachChildren(children) }
    })
  }

  return attachChildren(byParent.get(null) || [])
}

function CommentNode({ comment, onReply, depth = 0, isAuthenticated }) {
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState("")
  const author = comment.authorId || {}

  const submitReply = async () => {
    const text = replyText.trim()
    if (!text) return
    await onReply(comment._id, text)
    setReplyText("")
    setReplyOpen(false)
  }

  return (
    <div className={depth > 0 ? "ml-6 border-l border-emerald-100 pl-4" : ""}>
      <div className="flex gap-3 rounded-2xl bg-white/90 p-3 shadow-sm ring-1 ring-emerald-100">
        <Link to={`/profile/${author?._id}`} className="hover:opacity-80 transition-opacity flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>{author.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <Link to={`/profile/${author?._id}`} className="text-sm font-semibold text-slate-900 hover:text-emerald-600 transition-colors">
              {author.name || "Người dùng"}
            </Link>
            <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{comment.content}</p>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setReplyOpen((prev) => !prev)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              <CornerDownRight className="h-3.5 w-3.5" />
              Trả lời
            </button>
          )}
        </div>
      </div>

      {replyOpen && isAuthenticated && (
        <div className="mt-2 space-y-2">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={2}
            placeholder="Viết phản hồi..."
            className="rounded-2xl bg-white"
          />
          <div className="flex justify-end">
            <Button type="button" size="sm" onClick={submitReply} className="rounded-full bg-emerald-600 hover:bg-emerald-700">
              <Send className="mr-2 h-4 w-4" />
              Gửi
            </Button>
          </div>
        </div>
      )}

      {comment.children?.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.children.map((child) => (
            <CommentNode
              key={child._id}
              comment={child}
              onReply={onReply}
              depth={depth + 1}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SocialCommentThread({ comments = [], onReply, isAuthenticated }) {
  const tree = buildCommentTree(comments)

  if (!tree.length) {
    return (
      <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 px-4 py-6 text-center text-sm text-emerald-900/70">
        Chưa có bình luận nào
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tree.map((comment) => (
        <CommentNode
          key={comment._id}
          comment={comment}
          onReply={onReply}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  )
}