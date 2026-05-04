import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CAMPAIGN_STATUS } from "@/constants/enums"

export default function CampaignFilters({
  search = "",
  onSearchChange,
  status = "",
  onStatusChange,
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tìm kiếm chiến dịch..."
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status filter */}
      {onStatusChange && (
        <Select
          value={status || "all"}
          onValueChange={(val) => onStatusChange(val === "all" ? "" : val)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value={CAMPAIGN_STATUS.ACTIVE}>
              Đang gây quỹ
            </SelectItem>
            <SelectItem value={CAMPAIGN_STATUS.GOAL_REACHED}>
              Đã đạt mục tiêu
            </SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
