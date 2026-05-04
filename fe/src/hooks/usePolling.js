import { useEffect, useRef, useState, useCallback } from "react"

export function usePolling({
  fn,             // async function to call
  interval = 3000, // polling interval in ms
  timeout = 300000, // max polling duration (5 min)
  enabled = false,  // whether to start polling
  isTerminal,     // function(data) => boolean, stops polling when true
  onSuccess,      // callback when terminal condition met
  onTimeout,      // callback when timeout reached
}) {
  const [data, setData] = useState(null)
  const [isPolling, setIsPolling] = useState(false)
  const intervalRef = useRef(null)
  const timeoutRef = useRef(null)
  const mountedRef = useRef(true)

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    intervalRef.current = null
    timeoutRef.current = null
    setIsPolling(false)
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (!enabled || !fn) return

    setIsPolling(true)

    const poll = async () => {
      try {
        const result = await fn()
        if (!mountedRef.current) return
        setData(result)
        if (isTerminal && isTerminal(result)) {
          stop()
          onSuccess?.(result)
        }
      } catch (err) {
        console.error("Polling error:", err)
      }
    }

    // Initial poll
    poll()

    // Set interval
    intervalRef.current = setInterval(poll, interval)

    // Set timeout
    timeoutRef.current = setTimeout(() => {
      stop()
      onTimeout?.()
    }, timeout)

    return () => stop()
  }, [enabled, fn, interval, timeout, isTerminal, onSuccess, onTimeout, stop])

  return { data, isPolling, stop }
}
