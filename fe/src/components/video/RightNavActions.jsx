import { createElement } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

function NavButton({ label, icon: Icon, disabled, onClick }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-800 shadow-md transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-35"
    >
      {createElement(Icon, { className: "h-6 w-6" })}
    </button>
  )
}

export default function RightNavActions({
  activeIndex,
  total,
  onPrevious,
  onNext,
}) {
  return (
    <aside className="hidden h-[100dvh] w-20 shrink-0 items-center justify-center lg:flex">
      <div className="flex flex-col gap-3">
        <NavButton
          label="Video trước"
          icon={ChevronUp}
          disabled={activeIndex <= 0}
          onClick={onPrevious}
        />
        <NavButton
          label="Video tiếp theo"
          icon={ChevronDown}
          disabled={activeIndex >= total - 1}
          onClick={onNext}
        />
      </div>
    </aside>
  )
}
