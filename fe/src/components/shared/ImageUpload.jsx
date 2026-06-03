import { useState, useRef } from "react"
import { Upload, ImageIcon, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { uploadApi } from "@/api/upload.api"

export default function ImageUpload({
  onUpload,
  preview: externalPreview,
  accept = "image/*",
  label = "Tải ảnh lên",
  returnPayload = false,
}) {
  const [uploading, setUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef(null)

  const preview = externalPreview || localPreview

  const handleFile = async (file) => {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh!")
      return
    }

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file)
    setLocalPreview(objectUrl)

    setUploading(true)
    try {
      const res = await uploadApi.uploadFile(file)
      const payload = res.data?.data || res.data
      const uploadedUrl = payload?.url || (typeof payload === 'string' ? payload : null)
      if (returnPayload) {
        onUpload?.(payload || null)
      } else {
        onUpload?.(uploadedUrl || null)
      }
      toast.success("Tải ảnh lên thành công!")
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Tải ảnh lên thất bại. Vui lòng thử lại!"
      )
      setLocalPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer?.files?.[0]
    if (file) handleFile(file)
  }

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so the same file can be selected again
    e.target.value = ""
  }

  const handleRemove = () => {
    setLocalPreview(null)
    onUpload?.(null)
  }

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-sm font-medium text-foreground">{label}</p>
      )}

      {preview ? (
        <div className="relative group w-full">
          <img
            src={preview}
            alt="Preview"
            className="h-48 w-full rounded-2xl border border-emerald-100 object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-2xl bg-emerald-950/35 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="bg-white text-emerald-700 hover:bg-emerald-50"
            >
              {uploading ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-1 h-4 w-4" />
              )}
              Đổi ảnh
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-colors",
            dragActive
              ? "border-emerald-500 bg-emerald-50"
              : "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/60",
            uploading && "pointer-events-none opacity-60"
          )}
          onClick={() => inputRef.current?.click()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploading ? (
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          ) : (
            <ImageIcon className="h-10 w-10 text-emerald-500" />
          )}
          <div className="text-center">
            <p className="text-sm font-medium text-emerald-800">
              {uploading ? "Đang tải lên..." : "Kéo thả ảnh vào đây"}
            </p>
            <p className="mt-1 text-xs text-emerald-700">
              hoặc nhấn để chọn file
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}
