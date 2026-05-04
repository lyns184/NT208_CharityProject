import { useState, useCallback } from "react"

export function usePagination(initialPage = 1) {
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)

  const goToPage = useCallback((p) => setPage(p), [])
  const nextPage = useCallback(() => setPage((p) => Math.min(p + 1, totalPages)), [totalPages])
  const prevPage = useCallback(() => setPage((p) => Math.max(p - 1, 1)), [])

  return { page, totalPages, setTotalPages, goToPage, nextPage, prevPage }
}
