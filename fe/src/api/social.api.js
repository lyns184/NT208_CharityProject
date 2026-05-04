import api from "./axios"
import { API } from "@/constants/api-endpoints"

export const getSocialPosts = (params) =>
  api.get(API.SOCIAL.POSTS, { params })

export const getSocialPost = (id) => api.get(API.SOCIAL.POST(id))

export const createSocialPost = (data) => api.post(API.SOCIAL.POSTS, data)

export const getSocialComments = (id) => api.get(API.SOCIAL.COMMENTS(id))

export const createSocialComment = (id, data) =>
  api.post(API.SOCIAL.COMMENTS(id), data)