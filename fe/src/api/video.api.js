import api from "./axios"

const BASE = "/api/v1/videos"

export const getVideos = (params) => api.get(BASE, { params })

export const getVideo = (id) => api.get(`${BASE}/${id}`)

export const createVideo = (data) => api.post(BASE, data)

export const updateVideo = (id, data) => api.put(`${BASE}/${id}`, data)

export const deleteVideo = (id) => api.delete(`${BASE}/${id}`)

export const likeVideo = (id) => api.post(`${BASE}/${id}/like`)

export const unlikeVideo = (id) => api.delete(`${BASE}/${id}/like`)

export const getVideoComments = (id) => api.get(`${BASE}/${id}/comments`)

export const createVideoComment = (id, data) =>
  api.post(`${BASE}/${id}/comments`, data)

export const recordVideoView = (id) => api.post(`${BASE}/${id}/view`)
