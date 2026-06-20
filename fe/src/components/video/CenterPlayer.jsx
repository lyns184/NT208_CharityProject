import VideoFeedItem from "./VideoFeedItem"

export default function CenterPlayer({
  items,
  feedRef,
  registerItem,
  onActive,
  onLike,
  onComment,
  onView,
}) {
  return (
    <main
      ref={feedRef}
      className="hide-scrollbar h-[100dvh] min-w-0 flex-1 overflow-y-scroll snap-y snap-mandatory scroll-smooth overscroll-contain"
    >
      {items.map((item, index) => (
        <VideoFeedItem
          key={item._id}
          item={item}
          index={index}
          feedRef={feedRef}
          registerItem={registerItem}
          onActive={onActive}
          onLike={onLike}
          onComment={onComment}
          onView={onView}
        />
      ))}
    </main>
  )
}
