import api from "./axios"
import { API } from "@/constants/api-endpoints"

export const authApi = {
  login: (data) => api.post(API.AUTH.LOGIN, data),
  register: (data) => api.post(API.AUTH.REGISTER, data),
  logout: () => api.post(API.AUTH.LOGOUT),
  refresh: (refreshToken) => api.post(API.AUTH.REFRESH, { refreshToken }),
}
