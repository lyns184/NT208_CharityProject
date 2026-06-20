import { useCallback, useRef, useState } from "react"
import CenterPlayer from "./CenterPlayer"
import LeftSidebar from "./LeftSidebar"
import RightNavActions from "./RightNavActions"
import VideoCommentsPanel from "./VideoCommentsPanel"

export default function VideoFeedLayout({
  items,
  organizers,
  onLike,
  onView,
  onCommentCreated,
}) {
  const feedRef = useRef(null)
  const itemRefs = useRef([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [commentsVideo, setCommentsVideo] = useState(null)

  const registerItem = useCallback((index, node) => {
    itemRefs.current[index] = node
  }, [])

  const handleActive = useCallback((index) => {
    setActiveIndex(index)
  }, [])

  const scrollToIndex = useCallback(
    (index) => {
      const safeIndex = Math.max(0, Math.min(index, items.length - 1))
      itemRefs.current[safeIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    },
    [items.length]
  )

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#eaf5ef]">
      <LeftSidebar organizers={organizers} />
      <CenterPlayer
        items={items}
        feedRef={feedRef}
        registerItem={registerItem}
        onActive={handleActive}
        onLike={onLike}
        onComment={setCommentsVideo}
        onView={onView}
      />
      <RightNavActions
        activeIndex={activeIndex}
        total={items.length}
        onPrevious={() => scrollToIndex(activeIndex - 1)}
        onNext={() => scrollToIndex(activeIndex + 1)}
      />
      <VideoCommentsPanel
        video={commentsVideo}
        open={Boolean(commentsVideo)}
        onOpenChange={(open) => {
          if (!open) setCommentsVideo(null)
        }}
        onCommentCreated={onCommentCreated}
      />
    </div>
  )
}
