import api from "./axios"
import { API } from "@/constants/api-endpoints"

export const requestDisbursement = (data) =>
  api.post(API.DISBURSEMENT.REQUEST, data)
// data: { campaignId, amount, reason, requestQrImage }

export const uploadProof = (id, formData) =>
  api.post(API.DISBURSEMENT.PROOF(id), formData)
// payload contains proofImages, proofETags, proofCaption

export const getDisbursement = (id) => api.get(`/api/v1/disbursement/${id}`)
