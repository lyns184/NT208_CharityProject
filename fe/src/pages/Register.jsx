import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import RegisterVisualPanel from "@/components/auth/RegisterVisualPanel"
import RegisterFormCard from "@/components/auth/RegisterFormCard"

export default function Register() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "INDIVIDUAL",
    agreeTerms: false,
  })
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      const msg = "Vui lòng nhập đầy đủ thông tin"
      setErrorMessage(msg)
      toast.error(msg)
      return
    }
    if (form.password.length < 6) {
      const msg = "Mật khẩu phải có ít nhất 6 ký tự"
      setErrorMessage(msg)
      toast.error(msg)
      return
    }
    if (form.password !== form.confirmPassword) {
      const msg = "Mật khẩu xác nhận không khớp"
      setErrorMessage(msg)
      toast.error(msg)
      return
    }
    if (!form.agreeTerms) {
      const msg = "Vui lòng đồng ý với điều khoản trước khi đăng ký"
      setErrorMessage(msg)
      toast.error(msg)
      return
    }

    setErrorMessage("")
    setLoading(true)
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        accountType: form.accountType,
      })
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.")
      navigate("/login")
    } catch (err) {
      const msg = err.response?.data?.message || "Đăng ký thất bại"
      setErrorMessage(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col overflow-hidden rounded-none bg-background md:min-h-[calc(100vh-9rem)] md:flex-row">
        <RegisterVisualPanel />
        <RegisterFormCard
          form={form}
          loading={loading}
          errorMessage={errorMessage}
          onFieldChange={handleChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
