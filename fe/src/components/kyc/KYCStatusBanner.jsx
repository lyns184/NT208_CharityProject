import { KYC_STATUS } from "@/constants/enums"
import { AlertTriangle, Clock, CheckCircle2, XCircle } from "lucide-react"

const STATUS_CONFIG = {
  [KYC_STATUS.NONE]: {
    icon: AlertTriangle,
    title: "Chưa xác minh danh tính",
    message: "Bạn cần xác minh danh tính để tạo chiến dịch và nhận tài trợ.",
    bgGradient: "from-yellow-50 to-yellow-100/50",
    borderColor: "border-yellow-300",
    iconColor: "text-yellow-600",
    textColor: "text-yellow-900",
    darkBg: "dark:from-yellow-950/40 dark:to-yellow-900/20",
    darkBorder: "dark:border-yellow-800",
    darkIcon: "dark:text-yellow-400",
    darkText: "dark:text-yellow-100",
  },
  [KYC_STATUS.PENDING]: {
    icon: Clock,
    title: "Xác minh đang được xử lý",
    message: "Yêu cầu của bạn đang được xem xét. Bạn sẽ được thông báo khi hoàn tất.",
    bgGradient: "from-blue-50 to-blue-100/50",
    borderColor: "border-blue-300",
    iconColor: "text-blue-600",
    textColor: "text-blue-900",
    darkBg: "dark:from-blue-950/40 dark:to-blue-900/20",
    darkBorder: "dark:border-blue-800",
    darkIcon: "dark:text-blue-400",
    darkText: "dark:text-blue-100",
  },
  [KYC_STATUS.APPROVED]: {
    icon: CheckCircle2,
    title: "Danh tính đã được xác minh",
    message: "Bạn được phép tạo chiến dịch và các hoạt động khác trên nền tảng.",
    bgGradient: "from-green-50 to-green-100/50",
    borderColor: "border-green-300",
    iconColor: "text-green-600",
    textColor: "text-green-900",
    darkBg: "dark:from-green-950/40 dark:to-green-900/20",
    darkBorder: "dark:border-green-800",
    darkIcon: "dark:text-green-400",
    darkText: "dark:text-green-100",
  },
  [KYC_STATUS.REJECTED]: {
    icon: XCircle,
    title: "Yêu cầu xác minh bị từ chối",
    message: "Vui lòng kiểm tra lại tài liệu của bạn và gửi lại yêu cầu.",
    bgGradient: "from-red-50 to-red-100/50",
    borderColor: "border-red-300",
    iconColor: "text-red-600",
    textColor: "text-red-900",
    darkBg: "dark:from-red-950/40 dark:to-red-900/20",
    darkBorder: "dark:border-red-800",
    darkIcon: "dark:text-red-400",
    darkText: "dark:text-red-100",
  },
}

export default function KYCStatusBanner({ status }) {
  const config = STATUS_CONFIG[status]

  if (!config) return null

  const Icon = config.icon

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border-2 transition-all duration-300
        ${config.borderColor} ${config.darkBorder}
        bg-linear-to-br ${config.bgGradient} ${config.darkBg}
        p-6 sm:p-8
      `}
    >
      {/* Decorative background element */}
      <div className="absolute right-0 top-0 h-24 w-24 opacity-10">
        <Icon className="h-24 w-24" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex gap-4 sm:gap-6">
        {/* Icon */}
        <div className="shrink-0">
          <Icon className={`h-8 w-8 sm:h-10 sm:w-10 ${config.iconColor} ${config.darkIcon}`} />
        </div>

        {/* Text */}
        <div className="flex-1">
          <h3
            className={`text-lg font-semibold sm:text-xl ${config.textColor} ${config.darkText}`}
          >
            {config.title}
          </h3>
          <p className={`mt-2 text-sm sm:text-base ${config.textColor} ${config.darkText} opacity-90`}>
            {config.message}
          </p>
        </div>
      </div>
    </div>
  )
}
