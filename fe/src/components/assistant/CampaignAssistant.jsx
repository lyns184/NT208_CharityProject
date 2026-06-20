import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import {
  Bot,
  Loader2,
  MessageCircleQuestion,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react"
import { streamCampaignAssistant } from "@/api/campaign-assistant.api"
import AssistantCampaignCard from "./AssistantCampaignCard"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const STORAGE_KEY = "openheart-campaign-assistant-v2"
const SUGGESTIONS = [
  "Các chiến dịch ở Thành phố Hồ Chí Minh",
  "Chiến dịch nào sắp đạt mục tiêu?",
  "Chiến dịch nào chưa có ai quyên góp?",
  "Chiến dịch nào sắp kết thúc?",
]

const INITIAL_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content:
    "Chào bạn, mình có thể giúp tìm chiến dịch theo địa điểm, tiến độ, lượt ủng hộ hoặc thời gian kết thúc.",
  campaigns: [],
}

function loadMessages() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) && saved.length ? saved : [INITIAL_MESSAGE]
  } catch {
    return [INITIAL_MESSAGE]
  }
}

export default function CampaignAssistant() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(loadMessages)
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [remaining, setRemaining] = useState(null)
  const abortRef = useRef(null)
  const scrollRef = useRef(null)
  const isVideoFeed = pathname === "/videos"

  const conversationHistory = useMemo(
    () =>
      messages
        .filter((item) => item.id !== "welcome" && item.content)
        .slice(-10)
        .map(({ role, content }) => ({ role, content })),
    [messages]
  )

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)))
  }, [messages])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, open])

  useEffect(
    () => () => {
      abortRef.current?.abort()
    },
    []
  )

  const resetConversation = () => {
    abortRef.current?.abort()
    setMessages([INITIAL_MESSAGE])
    setRemaining(null)
    setIsStreaming(false)
    sessionStorage.removeItem(STORAGE_KEY)
  }

  const sendMessage = async (rawMessage) => {
    const message = rawMessage.trim()
    if (!message || isStreaming) return

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      campaigns: [],
    }
    const assistantId = crypto.randomUUID()
    const history = conversationHistory

    setMessages((current) => [
      ...current,
      userMessage,
      { id: assistantId, role: "assistant", content: "", campaigns: [], status: "Đang kết nối..." },
    ])
    setInput("")
    setIsStreaming(true)
    abortRef.current = new AbortController()

    try {
      await streamCampaignAssistant({
        message,
        history,
        signal: abortRef.current.signal,
        onEvent: (event, data) => {
          if (event === "status") {
            setMessages((current) =>
              current.map((item) =>
                item.id === assistantId
                  ? { ...item, status: data.message }
                  : item
              )
            )
          }

          if (event === "meta") {
            setRemaining(data.remaining)
            setMessages((current) =>
              current.map((item) =>
                item.id === assistantId
                  ? { ...item, campaigns: data.campaigns || [], status: "Đang tổng hợp câu trả lời..." }
                  : item
              )
            )
          }

          if (event === "delta") {
            setMessages((current) =>
              current.map((item) =>
                item.id === assistantId
                  ? { ...item, content: item.content + (data.text || ""), status: "" }
                  : item
              )
            )
          }

          if (event === "done") {
            setMessages((current) =>
              current.map((item) =>
                item.id === assistantId
                  ? {
                      ...item,
                      disclaimer: data.disclaimer,
                      updatedAt: data.updatedAt,
                    }
                  : item
              )
            )
          }

          if (event === "error") {
            throw new Error(data.message)
          }
        },
      })
    } catch (error) {
      if (error.name === "AbortError") return
      setMessages((current) =>
        current.map((item) =>
          item.id === assistantId
            ? {
                ...item,
                content:
                  error.message ||
                  "Trợ lý đang bận. Bạn có thể thử một câu hỏi gợi ý bên dưới.",
                isError: true,
              }
            : item
        )
      )
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Mở trợ lý chiến dịch"
            className={`fixed z-40 flex h-13 w-13 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
              isVideoFeed
                ? "bottom-5 left-4 lg:bottom-6 lg:left-auto lg:right-24"
                : "bottom-5 right-4 sm:bottom-6 sm:right-6"
            }`}
          >
            <MessageCircleQuestion className="h-6 w-6" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">Trợ lý chiến dịch</TooltipContent>
      </Tooltip>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="h-[100dvh] w-full gap-0 border-0 bg-slate-50 p-0 sm:w-[420px] sm:max-w-[420px] sm:border-l"
        >
          <SheetHeader className="border-b border-emerald-100 bg-white px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <SheetTitle className="truncate text-base">
                    Trợ lý chiến dịch
                  </SheetTitle>
                  <SheetDescription className="truncate text-xs">
                    Dữ liệu trực tiếp từ OpenHeart
                  </SheetDescription>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={resetConversation}
                  title="Bắt đầu lại"
                  className="h-9 w-9"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  title="Đóng"
                  className="h-9 w-9"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          <div
            ref={scrollRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4"
          >
            {messages.map((item) => (
              <div
                key={item.id}
                className={`flex ${
                  item.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[88%] space-y-3 ${
                    item.role === "user"
                      ? "rounded-lg bg-emerald-600 px-3.5 py-2.5 text-sm text-white"
                      : ""
                  }`}
                >
                  {item.role === "assistant" && (
                    <div
                      className={`rounded-lg border px-3.5 py-3 text-sm leading-6 ${
                        item.isError
                          ? "border-red-200 bg-red-50 text-red-800"
                          : "border-emerald-100 bg-white text-slate-700"
                      }`}
                    >
                      {item.content ? (
                        <p className="whitespace-pre-wrap">{item.content}</p>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-500">
                          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                          {item.status || "Đang xử lý câu hỏi..."}
                        </div>
                      )}
                    </div>
                  )}

                  {item.role === "user" && (
                    <p className="whitespace-pre-wrap">{item.content}</p>
                  )}

                  {item.campaigns?.length > 0 && (
                    <div className="space-y-2">
                      {item.campaigns.map((campaign) => (
                        <AssistantCampaignCard
                          key={campaign.id}
                          campaign={campaign}
                          onNavigate={() => setOpen(false)}
                        />
                      ))}
                    </div>
                  )}

                  {item.disclaimer && (
                    <p className="px-1 text-[11px] leading-4 text-slate-400">
                      {item.disclaimer}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-emerald-100 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {messages.length <= 2 && !isStreaming && (
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => sendMessage(suggestion)}
                    className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 focus-within:border-emerald-400"
            >
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    handleSubmit(event)
                  }
                }}
                maxLength={2000}
                rows={1}
                placeholder="Hỏi về chiến dịch..."
                className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-sm outline-none placeholder:text-slate-400"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isStreaming}
                className="h-9 w-9 shrink-0 bg-emerald-600 hover:bg-emerald-700"
                aria-label="Gửi câu hỏi"
              >
                {isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>

            <div className="mt-2 flex items-center justify-between gap-3 px-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Gemini có thể mắc lỗi
              </span>
              {remaining !== null && <span>Còn {remaining} lượt hôm nay</span>}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
