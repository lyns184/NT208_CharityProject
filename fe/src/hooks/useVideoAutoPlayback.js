import { useEffect, useState } from "react"
import { useVideoSound } from "@/hooks/useVideoSound"

export function useVideoAutoPlayback({
  videoRef,
  rootRef,
  threshold = 0.9,
  onActiveChange,
}) {
  const { isMuted } = useVideoSound()
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    const root = rootRef.current
    if (!video || !root) return

    const pauseAndReset = () => {
      video.pause()
      if (video.currentTime > 0) video.currentTime = 0
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextActive =
          entry.isIntersecting && entry.intersectionRatio >= threshold

        setIsActive(nextActive)
        onActiveChange?.(nextActive)

        if (nextActive) {
          video.play().catch(() => {
            video.muted = true
            video.play().catch(() => {})
          })
        } else {
          pauseAndReset()
        }
      },
      {
        root,
        threshold: [0, 0.5, threshold, 1],
      }
    )

    observer.observe(video)
    return () => {
      observer.disconnect()
      pauseAndReset()
    }
  }, [onActiveChange, rootRef, threshold, videoRef])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = isMuted
    if (isActive) {
      video.play().catch(() => {})
    }
  }, [isActive, isMuted, videoRef])

  return isActive
}
