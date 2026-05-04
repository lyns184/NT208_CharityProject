import api from "./axios"
import { API } from "@/constants/api-endpoints"

export const getConversations = () => api.get(API.CHAT.CONVERSATIONS)

export const createConversation = (data) => api.post(API.CHAT.CONVERSATIONS, data)

export const getConversationMessages = (conversationId, params) =>
  api.get(API.CHAT.MESSAGES(conversationId), { params })

export const sendConversationMessage = (conversationId, data) =>
  api.post(API.CHAT.MESSAGES(conversationId), data)