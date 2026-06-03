import api from "./axios"
import { API } from "@/constants/api-endpoints"

export const uploadApi = {
  uploadFile: (file) => {
    const formData = new FormData()
    formData.append("file", file)
    return api.post(API.UPLOAD, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((res) => {
      const payload = res.data?.data || res.data
      // If backend returns an array for single-file uploads, unwrap it
      if (Array.isArray(payload) && payload.length === 1) {
        // normalize so callers receive a single object in data.data
        return { ...res, data: { ...res.data, data: payload[0] } }
      }
      return res
    })
  },
  uploadFiles: (files = [], folder) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    if (folder) formData.append('folder', folder)
    return api.post(API.UPLOAD, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
}
