import KYCUploadForm from "./KYCUploadForm"
import KYCTipsPanel from "./KYCTipsPanel"

export default function KYCLayoutWithTips({
  accountType,
  onSubmit,
  isLoading,
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-l-4 border-blue-600 pl-4 dark:border-blue-400">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Xác minh danh tính
        </h2>
      </div>

      {/* Two column layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column - Upload Form (2 columns) */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-blue-600 dark:bg-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tải lên giấy tờ tùy thân
              </h3>
            </div>
            <KYCUploadForm
              accountType={accountType}
              onSubmit={onSubmit}
              isLoading={isLoading}
              layout="grid"
              submitAlign="end"
            />
          </div>
        </div>

        {/* Right column - Tips Panel */}
        <div className="lg:col-span-1">
          <KYCTipsPanel />
        </div>
      </div>
    </div>
  )
}
