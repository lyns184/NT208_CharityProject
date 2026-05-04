import api from "./axios"
import { API } from "@/constants/api-endpoints"

export const getKYCList = (params) =>
  api.get(API.ADMIN.KYC_LIST, { params })

export const getAdminStats = () =>
  api.get(API.ADMIN.STATS)

export const approveKYC = (userId, data) =>
  api.put(API.ADMIN.KYC_APPROVE(userId), data)
// data: { status: "APPROVED" | "REJECTED", rejectionReason?: string }

export const approveCampaign = (id, data) =>
  api.put(API.ADMIN.CAMPAIGN_APPROVE(id), data)
// data: { status: "ACTIVE" | "REJECTED", rejectionReason?: string }

export const transferDisbursement = (id, data) =>
  api.put(API.ADMIN.DISBURSE_TRANSFER(id), data)
// data: { txHash: string }
