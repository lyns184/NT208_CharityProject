import { useState } from "react"
import { Link } from "react-router-dom"
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react"

export default function RegisterFormCard({
  form,
  loading,
  errorMessage,
  onFieldChange,
  onSubmit,
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <section className="flex flex-1 items-center justify-center bg-background px-5 py-10 sm:px-8 lg:px-14">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl leading-tight font-extrabold text-slate-900">Tạo tài khoản mới</h1>
          <p className="text-slate-600">Bắt đầu hành trình tạo ra những tác động tích cực ngay hôm nay.</p>
        </div>

        {errorMessage ? (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Loại tài khoản</label>
            <div className="grid grid-cols-2 rounded-full bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => onFieldChange("accountType", "INDIVIDUAL")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  form.accountType === "INDIVIDUAL"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Cá nhân
              </button>
              <button
                type="button"
                onClick={() => onFieldChange("accountType", "ORGANIZATION")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  form.accountType === "ORGANIZATION"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tổ chức
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
              Họ và tên / Tên tổ chức
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="name"
                value={form.name}
                onChange={(e) => onFieldChange("name", e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 pr-4 pl-10 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => onFieldChange("email", e.target.value)}
                placeholder="example@gmail.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 pr-4 pl-10 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => onFieldChange("password", e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 pr-12 pl-10 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-slate-700">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => onFieldChange("confirmPassword", e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 pr-4 pl-10 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>
          </div>

          <label className="flex items-start gap-3 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.agreeTerms}
              onChange={(e) => onFieldChange("agreeTerms", e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>
              Tôi đồng ý với các <button type="button" className="font-semibold text-emerald-700">Điều khoản</button> và <button type="button" className="font-semibold text-emerald-700">Chính sách bảo mật</button>.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-3.5 text-base font-bold text-white shadow-[0_10px_26px_-12px_rgba(5,150,105,0.85)] transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Đăng ký ngay"
            )}
          </button>
        </form>

        <p className="mt-8 border-t border-slate-200 pt-7 text-center text-slate-600">
          Đã có tài khoản?
          <Link to="/login" className="ml-2 font-bold text-blue-700 hover:text-blue-800">
            Đăng nhập
          </Link>
        </p>
      </div>
    </section>
  )
}
