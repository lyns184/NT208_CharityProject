import { useContext } from "react"
import { VideoSoundContext } from "@/contexts/video-sound-context"

export function useVideoSound() {
  const context = useContext(VideoSoundContext)
  if (!context) {
    throw new Error("useVideoSound must be used within VideoSoundProvider")
  }
  return context
}
