import { useCallback, useEffect, useMemo, useState } from "react"
import { getSocialPosts } from "@/api/social.api"
import { usePagination } from "./usePagination"

export function useSocialPosts(params = {}) {
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { page, totalPages, setTotalPages, goToPage, nextPage, prevPage } = usePagination()

  const paramsKey = useMemo(() => JSON.stringify(params || {}), [params])
  const stableParams = useMemo(() => {
    try {
      return JSON.parse(paramsKey)
    } catch {
      return {}
    }
  }, [paramsKey])

  const fetchPosts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await getSocialPosts({
        ...stableParams,
        page,
        limit: stableParams.limit || 8,
      })
      const payload = res.data?.data || res.data
      const list = payload?.posts ?? payload ?? []
      setPosts(Array.isArray(list) ? list : [])
      setTotalPages(payload?.pagination?.totalPages || 1)
    } catch (err) {
      setPosts([])
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }, [page, stableParams, setTotalPages])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return {
    posts,
    isLoading,
    error,
    page,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    refetch: fetchPosts,
  }
}