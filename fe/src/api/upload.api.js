import api from "./axios"
import { API } from "@/constants/api-endpoints"

export const uploadApi = {
  uploadFile: (file) => {
    const formData = new FormData()
    formData.append("file", file)
    return api.post(API.UPLOAD, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
}
