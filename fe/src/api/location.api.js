import api from "./axios"
import { API } from "@/constants/api-endpoints"

export const getProvinces = () => api.get(API.LOCATION.PROVINCES)

export const getWards = (provinceCode) =>
  api.get(API.LOCATION.WARDS(provinceCode))
