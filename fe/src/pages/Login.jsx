import { useState } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import LoginVisualPanel from "@/components/auth/LoginVisualPanel"
import LoginFormCard from "@/components/auth/LoginFormCard"

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMessage("Vui lòng nhập đầy đủ email và mật khẩu")
      toast.error("Vui lòng nhập đầy đủ email và mật khẩu")
      return
    }
    setErrorMessage("")
    setLoading(true)
    try {
      await login(email, password)
      toast.success("Đăng nhập thành công!")
    } catch (err) {
      const msg = err.response?.data?.message || "Đăng nhập thất bại"
      setErrorMessage(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col overflow-hidden rounded-none bg-background md:min-h-[calc(100vh-9rem)] md:flex-row">
        <LoginVisualPanel />
        <LoginFormCard
          email={email}
          password={password}
          loading={loading}
          errorMessage={errorMessage}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
