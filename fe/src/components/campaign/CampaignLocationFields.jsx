import { useEffect, useState } from "react"
import { MapPin } from "lucide-react"
import { getProvinces, getWards } from "@/api/location.api"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function extractData(response) {
  const payload = response.data?.data ?? response.data
  return Array.isArray(payload) ? payload : []
}

export default function CampaignLocationFields({
  value,
  onChange,
  disabled = false,
}) {
  const [provinces, setProvinces] = useState([])
  const [wards, setWards] = useState([])
  const [loadingProvinces, setLoadingProvinces] = useState(true)
  const [loadedProvinceCode, setLoadedProvinceCode] = useState("")

  useEffect(() => {
    let active = true

    getProvinces()
      .then((response) => {
        if (active) setProvinces(extractData(response))
      })
      .catch(() => {
        if (active) setProvinces([])
      })
      .finally(() => {
        if (active) setLoadingProvinces(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!value?.provinceCode) return

    let active = true
    const requestedProvinceCode = String(value.provinceCode)

    getWards(value.provinceCode)
      .then((response) => {
        if (active) {
          setWards(extractData(response))
          setLoadedProvinceCode(requestedProvinceCode)
        }
      })
      .catch(() => {
        if (active) {
          setWards([])
          setLoadedProvinceCode(requestedProvinceCode)
        }
      })

    return () => {
      active = false
    }
  }, [value?.provinceCode])

  const loadingWards =
    Boolean(value?.provinceCode) &&
    loadedProvinceCode !== String(value.provinceCode)

  const handleProvinceChange = (provinceCode) => {
    setWards([])
    setLoadedProvinceCode("")
    const province = provinces.find((item) => String(item.code) === provinceCode)
    onChange?.({
      provinceCode: province?.code || "",
      provinceName: province?.name || "",
      wardCode: "",
      wardName: "",
    })
  }

  const handleWardChange = (wardCode) => {
    const ward = wards.find((item) => String(item.code) === wardCode)
    onChange?.({
      ...value,
      wardCode: ward?.code || "",
      wardName: ward?.name || "",
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-emerald-600" />
        <Label className="text-sm font-semibold text-slate-900">
          Địa điểm thực hiện
        </Label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          value={value?.provinceCode ? String(value.provinceCode) : ""}
          onValueChange={handleProvinceChange}
          disabled={disabled || loadingProvinces}
        >
          <SelectTrigger className="h-11 w-full border-slate-200 bg-white">
            <SelectValue
              placeholder={loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"}
            />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {provinces.map((province) => (
              <SelectItem key={province.code} value={String(province.code)}>
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value?.wardCode ? String(value.wardCode) : ""}
          onValueChange={handleWardChange}
          disabled={disabled || !value?.provinceCode || loadingWards}
        >
          <SelectTrigger className="h-11 w-full border-slate-200 bg-white">
            <SelectValue
              placeholder={loadingWards ? "Đang tải..." : "Chọn phường/xã"}
            />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {wards.map((ward) => (
              <SelectItem key={ward.code} value={String(ward.code)}>
                {ward.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        Địa điểm được chọn từ danh mục hành chính Việt Nam và sẽ bị khóa sau khi chiến dịch được duyệt.
      </p>
    </div>
  )
}