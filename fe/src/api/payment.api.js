import api from "./axios"
import { API } from "@/constants/api-endpoints"

export const createPayment = (data) => api.post(API.PAYMENT.CREATE, data)
// data: { campaignId, amount, message, isAnonymous }
// returns: { payment: { _id, qrCodeUrl, amount, ... } }

export const getPaymentStatus = (id) => api.get(API.PAYMENT.STATUS(id))
// returns: { payment: { status, blockchainTxHash, blockchainStatus, ... } }
