import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import ImageUpload from "@/components/shared/ImageUpload"
import { ACCOUNT_TYPE } from "@/constants/enums"
import { Upload, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

const INDIVIDUAL_FIELDS = [
  { key: "idCardFront", label: "Mặt trước CMND/CCCD", hint: "Ảnh rõ nét, đủ 4 góc" },
  { key: "idCardBack", label: "Mặt sau CMND/CCCD", hint: "Bao gồm cả mã QR phía sau" },
  { key: "portrait", label: "Ảnh chân dung cùng với CMND", hint: "Cầm CMND ngay tay, tấm ảnh rõ khuôn mặt" },
]

const ORGANIZATION_FIELDS = [
  { key: "businessLicense", label: "Giấy phép kinh doanh", hint: "Giấy phép còn hiệu lực" },
  { key: "authLetter", label: "Thư uỷ quyền", hint: "Thư từ doanh nghiệp, có chữ ký và dấu" },
  { key: "repIdCard", label: "CMND người đại diện", hint: "Cả hai mặt hoặc ảnh chân dung" },
]

const createInitialFormData = (fields) =>
  fields.reduce((accumulator, field) => {
    accumulator[field.key] = null
    return accumulator
  }, {})

export default function KYCUploadForm({
  accountType,
  onSubmit,
  isLoading,
  layout = "grid",
  submitAlign = "start",
}) {
  const fields = useMemo(
    () =>
      accountType === ACCOUNT_TYPE.ORGANIZATION
        ? ORGANIZATION_FIELDS
        : INDIVIDUAL_FIELDS,
    [accountType]
  )

  const [formData, setFormData] = useState(() => createInitialFormData(fields))

  useEffect(() => {
    setFormData(createInitialFormData(fields))
  }, [fields])

  const handleUpload = (key, result) => {
    setFormData((prev) => ({ ...prev, [key]: result }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const missingFields = fields.filter((f) => !formData[f.key])
    if (missingFields.length > 0) {
      toast.error(
        `Vui lòng tải lên: ${missingFields.map((f) => f.label).join(", ")}`
      )
      return
    }

    onSubmit?.(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Info alert */}
      <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800/40 dark:bg-blue-950/20">
        <AlertCircle className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
        <div className="text-sm text-blue-900 dark:text-blue-100">
          <p className="font-medium">Lưu ý:</p>
          <p className="mt-1 opacity-90">
            Tài liệu phải rõ nét, đúng định dạng. Hệ thống sẽ kiểm duyệt trong 1-2 ngày làm việc.
          </p>
        </div>
      </div>

      {/* Upload fields */}
      <div
        className={
          layout === "stacked"
            ? "space-y-6"
            : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {fields.map((field) => (
          <div
            key={field.key}
            className="group rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-950 dark:hover:border-gray-600 dark:hover:shadow-lg dark:hover:shadow-black/20"
          >
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {field.label}
                </Label>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{field.hint}</p>
              </div>

              <div className="rounded-md border-2 border-dashed border-gray-300 bg-gray-50 transition-colors duration-200 group-hover:border-gray-400 group-hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900/50 dark:group-hover:border-gray-500 dark:group-hover:bg-gray-800/50">
                <ImageUpload
                  label=""
                  preview={formData[field.key] || null}
                  onUpload={(result) => handleUpload(field.key, result)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit button */}
      <div className={submitAlign === "end" ? "flex justify-end pt-2" : "flex justify-start pt-2"}>
        <Button
          type="submit"
          disabled={isLoading}
          size="lg"
          className="w-full gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 sm:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang gửi...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Gửi xác minh danh tính
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
