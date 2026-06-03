import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { createConversation, getConversationMessages, getConversations, sendConversationMessage } from "@/api/chat.api"
import { uploadApi } from "@/api/upload.api"
import { createChatSocket } from "@/lib/socket"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/utils"
import {
  Image as ImageIcon,
  SendHorizontal,
  Search,
  MessageSquare,
} from "lucide-react"
import { toast } from "sonner"

function getOtherParticipant(conversation, currentUserId) {
  const participants = conversation?.participants || []
  return (
    conversation?.otherParticipant ||
    participants.find((participant) => participant?._id?.toString() !== currentUserId?.toString()) ||
    participants[0] ||
    null
  )
}

function isImageMessage(message) {
  const type = String(message?.type || "").toUpperCase()
  const content = String(message?.content || "")
  return type === "IMAGE" || /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/i.test(content)
}

function isVideoMessage(message) {
  const type = String(message?.type || "").toUpperCase()
  const content = String(message?.content || "")
  return type === "VIDEO" || /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(content)
}

function getLastMessagePreview(lastMessage) {
  if (!lastMessage) return "Bắt đầu cuộc trò chuyện"

  const type = String(lastMessage?.type || "").toUpperCase()
  const content = typeof lastMessage === "string" ? lastMessage : String(lastMessage?.content || "")

  if (type === "IMAGE") return "Hình ảnh"
  if (type === "VIDEO") return "Video"

  if (/\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/i.test(content)) return "Hình ảnh"
  if (/\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(content)) return "Video"

  return content || "Bắt đầu cuộc trò chuyện"
}

function formatConversationTime(value) {
  if (!value) return ""

  const date = new Date(value)
  const now = new Date()
  const diffMs = now - date
  const diffHours = diffMs / (1000 * 60 * 60)

  if (diffHours < 1) return "Vừa xong"
  if (diffHours < 24) return `${Math.floor(diffHours)}h trước`

  return formatDate(value)
}

export default function Messages() {
  const { userId } = useParams()
  const { user } = useAuth()

  const [socket, setSocket] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState("")
  const [fileUploading, setFileUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedPreview, setSelectedPreview] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [mobileView, setMobileView] = useState("list")

  const activeConversationIdRef = useRef(null)
  const messageEndRef = useRef(null)
  const openedTargetUserRef = useRef(null)
  const fileInputRef = useRef(null)

  const activeOtherParticipant = useMemo(
    () => getOtherParticipant(activeConversation, user?._id),
    [activeConversation, user?._id]
  )

  const scrollToBottom = useCallback(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const loadConversations = useCallback(async () => {
    setLoadingConversations(true)
    try {
      const res = await getConversations()
      const payload = res.data?.data || res.data
      const items = Array.isArray(payload) ? payload : payload?.conversations || []
      setConversations(items)
      return items
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách hội thoại")
      setConversations([])
      return []
    } finally {
      setLoadingConversations(false)
    }
  }, [])

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return
    setLoadingMessages(true)
    try {
      const res = await getConversationMessages(conversationId, { page: 1, limit: 50 })
      const payload = res.data?.data || res.data
      const items = Array.isArray(payload?.messages) ? payload.messages : []
      setMessages(items)
      requestAnimationFrame(scrollToBottom)
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải tin nhắn")
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }, [scrollToBottom])

  const openConversationWithUser = useCallback(async (targetUserId) => {
    if (!targetUserId) return
    try {
      const res = await createConversation({ participantId: targetUserId, contextType: "DIRECT" })
      const conversation = res.data?.data || res.data
      setActiveConversation(conversation)
      setConversations((current) => {
        const withoutCurrent = current.filter((item) => item._id !== conversation._id)
        return [conversation, ...withoutCurrent]
      })
      return conversation
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể mở cuộc trò chuyện")
      return null
    }
  }, [])

  useEffect(() => {
    const client = createChatSocket()

    setSocket(client)

    return () => {
      client.disconnect()
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (userId) {
      if (openedTargetUserRef.current === userId) {
        return
      }
      openedTargetUserRef.current = userId
      openConversationWithUser(userId)
      setMobileView("chat")
      return
    }

    if (!userId && conversations.length && !activeConversation) {
      setActiveConversation(conversations[0])
      setMobileView("chat")
    }
  }, [userId, conversations, activeConversation, openConversationWithUser])

  useEffect(() => {
    if (!activeConversation) {
      setMobileView("list")
    }
  }, [activeConversation])

  useEffect(() => {
    const conversationId = activeConversation?._id
    activeConversationIdRef.current = conversationId || null

    if (!conversationId) return

    loadMessages(conversationId)

    if (socket) {
      socket.emit("conversation:join", conversationId)
    }

    return () => {
      if (socket) {
        socket.emit("conversation:leave", conversationId)
      }
    }
  }, [activeConversation?._id, socket, loadMessages])

  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (message) => {
      const conversationId = message?.conversationId?._id || message?.conversationId
      if (conversationId?.toString() === activeConversationIdRef.current?.toString()) {
        setMessages((current) => {
          if (current.some((item) => item._id === message._id)) {
            return current
          }
          return [...current, message]
        })
        requestAnimationFrame(scrollToBottom)
      }

      setConversations((current) => {
        const matchIndex = current.findIndex(
          (conversation) => conversation?._id?.toString() === conversationId?.toString()
        )

        if (matchIndex === -1) {
          return current
        }

        const targetConversation = current[matchIndex]
        const updatedConversation = {
          ...targetConversation,
          lastMessage: message,
          lastMessageAt: message?.createdAt || new Date().toISOString(),
        }

        return [updatedConversation, ...current.filter((_, idx) => idx !== matchIndex)]
      })
    }

    socket.on("message:new", handleNewMessage)
    return () => {
      socket.off("message:new", handleNewMessage)
    }
  }, [socket, scrollToBottom])

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation)
    setMobileView("chat")
  }

  const updateConversationFromMessage = useCallback((message) => {
    const conversationId = message?.conversationId?._id || message?.conversationId

    setConversations((current) => {
      const matchIndex = current.findIndex(
        (conversation) => conversation?._id?.toString() === conversationId?.toString()
      )

      if (matchIndex === -1) {
        return current
      }

      const targetConversation = current[matchIndex]
      const updatedConversation = {
        ...targetConversation,
        lastMessage: message,
        lastMessageAt: message?.createdAt || new Date().toISOString(),
      }

      return [updatedConversation, ...current.filter((_, idx) => idx !== matchIndex)]
    })
  }, [])

  const handleSendMessage = async () => {
    const text = messageText.trim()
    if (!activeConversation) return

    setSending(true)
    try {
      // If a file is selected, upload it first and send as attachment
      if (selectedFile) {
        const file = selectedFile
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
          toast.error('Tệp quá lớn — giới hạn 5MB')
          return
        }
        setFileUploading(true)
        try {
          const res = await uploadApi.uploadFile(file)
          const payload = res.data?.data || res.data
          const url = payload?.url || payload
          const mime = file.type || ''
          const type = mime.startsWith('video/') ? 'VIDEO' : 'IMAGE'

          if (socket?.connected) {
            socket.emit('message:send', { conversationId: activeConversation._id, content: url, type }, (response) => {
              if (!response?.success) toast.error(response?.message || 'Không thể gửi tệp')
            })
          } else {
            const r = await sendConversationMessage(activeConversation._id, { content: url, type })
            const msg = r.data?.data || r.data
            setMessages((current) => [...current, msg])
            requestAnimationFrame(scrollToBottom)
            updateConversationFromMessage(msg)
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Không thể tải tệp lên')
        } finally {
          setFileUploading(false)
          setSelectedFile(null)
          if (selectedPreview) {
            URL.revokeObjectURL(selectedPreview)
            setSelectedPreview(null)
          }
        }
      }

      // If there is text, send it
      if (text) {
        if (socket?.connected) {
          socket.emit(
            'message:send',
            { conversationId: activeConversation._id, content: text, type: 'TEXT' },
            (response) => {
              if (!response?.success) {
                toast.error(response?.message || 'Không thể gửi tin nhắn')
              }
            }
          )
        } else {
          const res = await sendConversationMessage(activeConversation._id, { content: text })
          const message = res.data?.data || res.data
          setMessages((current) => [...current, message])
          requestAnimationFrame(scrollToBottom)
          updateConversationFromMessage(message)
        }
        setMessageText('')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể gửi tin nhắn")
    } finally {
      setSending(false)
    }
  }

  const conversationList = conversations.map((conversation) => {
    const otherParticipant = getOtherParticipant(conversation, user?._id)
    return {
      ...conversation,
      displayParticipant: otherParticipant,
    }
  })

  const filteredConversationList = conversationList.filter((conversation) => {
    const participantName = conversation?.displayParticipant?.name || ""
    return participantName.toLowerCase().includes(searchQuery.trim().toLowerCase())
  })

  return (
    <div className="mx-auto my-0 flex h-[calc(100vh-5rem)] w-full max-w-7xl overflow-hidden rounded-none border-0 bg-[#eff4ff] md:my-4 md:h-[calc(100vh-9rem)] md:rounded-3xl md:border md:border-slate-200">
      <aside
        className={`flex w-full flex-col border-r border-slate-200/70 bg-white md:max-w-95 ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}
      >
        <div className="border-b border-slate-200/70 px-5 pb-4 pt-5">
          <h2 className="text-[30px] font-extrabold tracking-tight text-slate-900">Tin nhắn</h2>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tin nhắn..."
              className="h-11 w-full rounded-xl border border-transparent bg-emerald-50 pl-9 pr-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
              type="text"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-2xl bg-slate-100 p-4">
                  <div className="h-4 w-1/2 rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-3/4 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : filteredConversationList.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              {searchQuery.trim() ? "Không tìm thấy hội thoại phù hợp." : "Chưa có hội thoại nào."}
            </div>
          ) : (
            <div>
              {filteredConversationList.map((conversation) => {
                const participant = conversation.displayParticipant
                const isActive = activeConversation?._id === conversation._id

                return (
                  <button
                    key={conversation._id}
                    type="button"
                    onClick={() => handleSelectConversation(conversation)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                      isActive
                        ? "border-l-4 border-emerald-600 bg-emerald-50/60"
                        : "border-l-4 border-transparent hover:bg-slate-50"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-14 w-14 rounded-xl">
                        <AvatarImage src={participant?.avatar} alt={participant?.name} />
                        <AvatarFallback className="rounded-xl">
                          {participant?.name?.charAt(0)?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-extrabold text-slate-800">
                          {participant?.name || "Người dùng"}
                        </p>
                        <span
                          className={`text-[10px] font-semibold uppercase ${
                            isActive ? "text-emerald-700" : "text-slate-400"
                          }`}
                        >
                          {formatConversationTime(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                        {getLastMessagePreview(conversation.lastMessage)}
                      </p>
                    </div>

                  </button>
                )
              })}
            </div>
          )}
        </div>
      </aside>

      <section
        className={`min-w-0 flex-1 flex-col bg-emerald-50 ${mobileView === "list" ? "hidden md:flex" : "flex"}`}
      >
        {activeConversation ? (
          <>
            <header className="flex h-20 items-center justify-between border-b border-slate-200/70 bg-white/90 px-4 backdrop-blur md:px-7">
              <button
                type="button"
                className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 md:hidden"
                onClick={() => setMobileView("list")}
              >
                Quay lại
              </button>
              <Link
                to={activeOtherParticipant?._id ? `/profile/${activeOtherParticipant._id}` : "/messages"}
                className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-85"
              >
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage src={activeOtherParticipant?.avatar} alt={activeOtherParticipant?.name} />
                  <AvatarFallback className="rounded-lg">
                    {activeOtherParticipant?.name?.charAt(0)?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <h3 className="truncate text-lg font-bold text-slate-900">
                  {activeOtherParticipant?.name || "Cuộc trò chuyện"}
                </h3>
              </Link>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6">
              {loadingMessages ? (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="animate-pulse rounded-2xl bg-slate-100 p-4">
                      <div className="h-3 w-20 rounded bg-slate-200" />
                      <div className="mt-2 h-4 w-3/4 rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex min-h-full items-center justify-center text-sm text-slate-500">
                  Chưa có tin nhắn nào. Hãy gửi lời chào đầu tiên.
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => {
                    const senderId = message.senderId?._id || message.senderId
                    const isMine = senderId?.toString() === user?._id?.toString()
                    const isMediaMessage = isImageMessage(message) || isVideoMessage(message)

                    return (
                      <div
                        key={message._id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[85%] sm:max-w-[72%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-1.5`}>
                          <div
                            className={`px-5 py-3 text-sm shadow-sm ${
                              isMine
                                ? "rounded-2xl rounded-tr-none bg-emerald-600 text-white"
                                : "rounded-2xl rounded-tl-none bg-emerald-100 text-slate-800"
                            }`}
                          >
                            {isMediaMessage ? (
                              isImageMessage(message) ? (
                                <img
                                  src={message.content}
                                  alt="Ảnh đính kèm"
                                  className="max-h-80 w-full rounded-xl object-cover"
                                />
                              ) : (
                                <video
                                  src={message.content}
                                  controls
                                  className="max-h-80 w-full rounded-xl object-cover"
                                />
                              )
                            ) : (
                              <p className="whitespace-pre-wrap wrap-break-word leading-relaxed">
                                {message.content}
                              </p>
                            )}
                          </div>
                          <span className="px-2 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messageEndRef} />
                </div>
              )}
            </div>

            <div className="border-t border-slate-200/70 bg-white px-3 py-3 md:px-6 md:py-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return

                  const maxSize = 5 * 1024 * 1024
                  if (file.size > maxSize) {
                    toast.error("Tệp quá lớn — giới hạn 5MB")
                    e.target.value = null
                    return
                  }

                  const preview = URL.createObjectURL(file)
                  if (selectedPreview) {
                    URL.revokeObjectURL(selectedPreview)
                  }

                  setSelectedFile(file)
                  setSelectedPreview(preview)
                  e.target.value = null
                }}
              />

              {selectedPreview && (
                <div className="mb-3 inline-flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-2">
                  {selectedFile?.type?.startsWith("video/") ? (
                    <video src={selectedPreview} className="h-24 w-36 rounded-xl object-cover" muted />
                  ) : (
                    <img src={selectedPreview} alt="preview" className="h-24 w-36 rounded-xl object-cover" />
                  )}
                  <button
                    type="button"
                    className="text-sm font-medium text-slate-600 hover:text-slate-900"
                    onClick={() => {
                      if (selectedPreview) URL.revokeObjectURL(selectedPreview)
                      setSelectedPreview(null)
                      setSelectedFile(null)
                    }}
                  >
                    Xóa
                  </button>
                </div>
              )}

              <div className="flex items-end gap-2 rounded-2xl bg-emerald-50 p-2 pr-2 md:gap-3 md:pr-3">
                <div className="flex items-center">
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-emerald-100"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={fileUploading}
                  >
                    <ImageIcon className="h-5 w-5" />
                  </button>
                </div>

                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={1}
                  placeholder="Nhập tin nhắn..."
                  className="min-h-10 max-h-28 flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm focus-visible:ring-0"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />

                <Button
                  onClick={handleSendMessage}
                  disabled={sending || (!messageText.trim() && !selectedFile)}
                  className="h-10 w-10 shrink-0 rounded-xl bg-[#006c49] p-0 text-white shadow-lg shadow-emerald-900/20 hover:bg-[#005a3d]"
                >
                  <SendHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-h-full items-center justify-center px-8 text-center">
            <div className="max-w-md space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <MessageSquare className="h-7 w-7" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Chọn một hội thoại</h1>
              <p className="text-sm leading-7 text-slate-500">
                Chọn người ở danh sách bên trái để bắt đầu trao đổi.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}