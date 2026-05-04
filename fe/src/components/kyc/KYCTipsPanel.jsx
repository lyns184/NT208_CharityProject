import { CheckCircle2, Shield, Image as ImageIcon } from "lucide-react"

const TIPS = [
  {
    title: "Ảnh sắc nét",
    description: "Hình ảnh phải rõ ràng, không mờ, không bị cắt xén.",
  },
  {
    title: "Bộ đồ & sắc nét",
    description: "Không được chỉnh sửa ảnh. Ảnh chân dung phải nhìn thẳng vào camera.",
  },
  {
    title: "Không chỉnh sửa",
    description: "Sử dụng định dạng JPG hoặc PNG. Dung lượng tối đa 10MB.",
  },
]

export default function KYCTipsPanel() {
  return (
    <div className="space-y-6">
      {/* Tips Section */}
      <div className="rounded-lg border-2 border-blue-200 bg-linear-to-br from-blue-50 to-blue-100/50 p-6 dark:border-blue-800/50 dark:from-blue-950/30 dark:to-blue-900/20">
        <div className="mb-6 flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            Mẹo xác minh nhanh
          </h3>
        </div>

        <div className="space-y-4">
          {TIPS.map((tip, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white dark:bg-blue-500">
                {idx + 1}
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                  {tip.title}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  {tip.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Section */}
      <div className="rounded-lg border-2 border-green-200 bg-linear-to-br from-green-50 to-green-100/50 p-6 dark:border-green-800/50 dark:from-green-950/30 dark:to-green-900/20">
        <div className="flex items-start gap-4">
          <Shield className="h-6 w-6 shrink-0 text-green-600 dark:text-green-400" />
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              Dữ liệu được bảo mật tuyệt đối
            </h3>
            <p className="mt-2 text-sm text-green-700 dark:text-green-200">
              Chúng tôi đảm bảo dữ liệu sẽ được bảo mật tuyệt đối.
              Chỉ có nhân viên kiểm duyệt được phép xem dữ liệu này.
            </p>
          </div>
        </div>
      </div>

      {/* Example Image Section */}
      <div className="group overflow-hidden rounded-lg border-2 border-amber-200 bg-linear-to-br from-amber-50 to-amber-100/50 p-6 transition-all duration-300 hover:border-amber-300 dark:border-amber-800/50 dark:from-amber-950/30 dark:to-amber-900/20 dark:hover:border-amber-700">
        <div className="mb-4 flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <h4 className="font-semibold text-amber-900 dark:text-amber-100">Ví dụ minh họa</h4>
        </div>

        {/* Image placeholder */}
        <div className="relative aspect-video overflow-hidden rounded-md border-2 border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20">
          <img
            src="/unnamed.png"
            alt="Ví dụ ảnh CMND"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Info text */}
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-200">
          💡 Ảnh phải rõ nét, cả 4 góc, chưa được chỉnh sửa. Đảm bảo tất cả thông tin trên tài liệu đều nhìn rõ.
        </p>
      </div>
    </div>
  )
}
