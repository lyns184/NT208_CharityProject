import { useState, useEffect, useCallback } from "react"
import { getCampaigns } from "@/api/campaign.api"
import { useDebounce } from "./useDebounce"
import { usePagination } from "./usePagination"

export function useCampaigns({ status, limit = 12 } = {}) {
  const [campaigns, setCampaigns] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 400)
  const { page, totalPages, setTotalPages, goToPage, nextPage, prevPage } = usePagination()

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = { page, limit }
      if (status) params.status = status
      if (debouncedSearch) params.search = debouncedSearch
      const res = await getCampaigns(params)
      const payload = res.data?.data || res.data
      const list = payload?.campaigns ?? payload ?? []
      setCampaigns(Array.isArray(list) ? list : [])
      setTotalPages(payload?.totalPages || payload?.pagination?.totalPages || 1)
    } catch (err) {
      console.error("Failed to fetch campaigns:", err)
      setCampaigns([])
    } finally {
      setIsLoading(false)
    }
  }, [page, limit, status, debouncedSearch, setTotalPages])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  // Reset page when search changes
  useEffect(() => {
    goToPage(1)
  }, [debouncedSearch, goToPage])

  return {
    campaigns,
    isLoading,
    search,
    setSearch,
    page,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    refetch: fetchCampaigns,
  }
}
