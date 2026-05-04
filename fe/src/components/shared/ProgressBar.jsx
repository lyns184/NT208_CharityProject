import { Progress } from "@/components/ui/progress"
import { cn, formatPercent, formatVND } from "@/lib/utils"

export default function ProgressBar({ current = 0, goal = 0, className }) {
  const percent = formatPercent(current, goal)
  const rawPercent = goal > 0 ? Math.round((current / goal) * 100) : 0
  const isComplete = rawPercent >= 100

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {formatVND(current)} / {formatVND(goal)}
        </span>
        <span
          className={cn(
            "font-semibold",
            isComplete ? "text-green-600" : "text-primary"
          )}
        >
          {rawPercent}%
        </span>
      </div>
      <Progress
        value={percent}
        className={cn(
          "h-2.5",
          isComplete && "[&>[data-slot=progress-indicator]]:bg-green-600"
        )}
      />
    </div>
  )
}
