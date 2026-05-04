import api from "./axios"
import { API } from "@/constants/api-endpoints"

export const getCampaigns = (params) =>
  api.get(API.CAMPAIGN.LIST, { params })

export const getCampaignDetail = (id) =>
  api.get(API.CAMPAIGN.DETAIL(id))

export const createCampaign = (data) => {
  if (data instanceof FormData) {
    return api.post(API.CAMPAIGN.CREATE, data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  }
  return api.post(API.CAMPAIGN.CREATE, data)
}

export const updateCampaign = (id, data) => {
  if (data instanceof FormData) {
    return api.put(API.CAMPAIGN.UPDATE(id), data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  }
  return api.put(API.CAMPAIGN.UPDATE(id), data)
}

export const closeCampaign = (id) =>
  api.put(API.CAMPAIGN.CLOSE(id))

export const deleteCampaign = (id) =>
  api.put(API.CAMPAIGN.DELETE_ACTION(id))

export const getCampaignDonations = (id) =>
  api.get(API.CAMPAIGN.DONATIONS(id))

export const getCampaignSummary = (id) =>
  api.get(API.CAMPAIGN.SUMMARY(id))

export const getRelatedCampaigns = (id) =>
  api.get(API.CAMPAIGN.RELATED(id))

export const getCampaignProofs = (id) =>
  api.get(API.CAMPAIGN.PROOFS(id))
