import api from "./axios"
import { API } from "@/constants/api-endpoints"

export const verifyDonation = (id) => api.get(API.VERIFY.DONATION(id))
// returns blockchain verification data for a donation
