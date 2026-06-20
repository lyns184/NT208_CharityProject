import { useMemo, useState } from "react"
import { VideoSoundContext } from "@/contexts/video-sound-context"


export function VideoSoundProvider({ children }) {
  const [isMuted, setIsMuted] = useState(true)

  const value = useMemo(
    () => ({
      isMuted,
      setIsMuted,
      toggleMuted: () => setIsMuted((current) => !current),
    }),
    [isMuted]
  )

  return (
    <VideoSoundContext.Provider value={value}>
      {children}
    </VideoSoundContext.Provider>
  )
}

