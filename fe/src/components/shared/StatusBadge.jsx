import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STATUS_MAP = {
  campaign: {
    PENDING: {
      variant: "outline",
      className: "border-yellow-500 text-yellow-700 bg-yellow-50",
      label: "Chờ duyệt",
    },
    ACTIVE: {
      variant: "default",
      className: "bg-green-600 text-white hover:bg-green-700",
      label: "Đang hoạt động",
    },
    GOAL_REACHED: {
      variant: "default",
      className: "bg-blue-600 text-white hover:bg-blue-700",
      label: "Đạt mục tiêu",
    },
    CLOSED: {
      variant: "secondary",
      className: "bg-gray-200 text-gray-700",
      label: "Đã đóng",
    },
    REJECTED: {
      variant: "destructive",
      className: "",
      label: "Từ chối",
    },
  },
  kyc: {
    NONE: {
      variant: "outline",
      className: "",
      label: "Chưa xác minh",
    },
    PENDING: {
      variant: "outline",
      className: "border-yellow-500 text-yellow-700 bg-yellow-50",
      label: "Chờ duyệt",
    },
    APPROVED: {
      variant: "default",
      className: "bg-green-600 text-white hover:bg-green-700",
      label: "Đã xác minh",
    },
    REJECTED: {
      variant: "destructive",
      className: "",
      label: "Từ chối",
    },
  },
  disbursement: {
    PENDING_VERIFY: {
      variant: "outline",
      className: "border-yellow-500 text-yellow-700 bg-yellow-50",
      label: "Chờ xác minh",
    },
    PENDING_TRANSFER: {
      variant: "outline",
      className: "border-yellow-500 text-yellow-700 bg-yellow-50",
      label: "Chờ xác minh",
    },
    COMPLETED: {
      variant: "default",
      className: "bg-green-600 text-white hover:bg-green-700",
      label: "Đã giải ngân",
    },
  },
  payment: {
    PENDING: {
      variant: "outline",
      className: "border-yellow-500 text-yellow-700 bg-yellow-50",
      label: "Chờ xử lý",
    },
    SUCCESS: {
      variant: "default",
      className: "bg-green-600 text-white hover:bg-green-700",
      label: "Thành công",
    },
  },
  blockchain: {
    PENDING: {
      variant: "outline",
      className: "border-yellow-500 text-yellow-700 bg-yellow-50",
      label: "Đang xử lý",
    },
    SUCCESS: {
      variant: "default",
      className: "bg-green-600 text-white hover:bg-green-700",
      label: "Thành công",
    },
    FAILED: {
      variant: "destructive",
      className: "",
      label: "Thất bại",
    },
    IGNORED: {
      variant: "secondary",
      className: "bg-gray-200 text-gray-700",
      label: "Bỏ qua",
    },
  },
}

export default function StatusBadge({ status, type }) {
  if (!status || !type) return null

  const typeMap = STATUS_MAP[type]
  if (!typeMap) return null

  const config = typeMap[status]
  if (!config) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        {status}
      </Badge>
    )
  }

  return (
    <Badge variant={config.variant} className={cn(config.className)}>
      {config.label}
    </Badge>
  )
}
