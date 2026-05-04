import { useState } from "react"
import { Link } from "react-router-dom"
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react"

export default function LoginFormCard({
  email,
  password,
  loading,
  errorMessage,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <section className="flex flex-1 items-center justify-center bg-background px-5 py-10 sm:px-8 lg:px-14">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl leading-tight font-extrabold text-slate-900">Chào mừng bạn trở lại</h1>
          <p className="text-slate-600">Tiếp tục hành trình lan tỏa những giá trị tốt đẹp.</p>
        </div>

        {errorMessage ? (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
              Địa chỉ Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@impact.org"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Mật khẩu
              </label>
              <button type="button" className="text-xs font-semibold text-blue-700 hover:text-blue-800">
                Quên mật khẩu?
              </button>
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 pr-12 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
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

          <label className="flex items-center gap-3 text-sm text-slate-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            Ghi nhớ đăng nhập trong 30 ngày
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-emerald-700 to-emerald-400 px-4 py-3.5 text-base font-bold text-white shadow-[0_10px_26px_-12px_rgba(5,150,105,0.8)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              <>
                Đăng nhập
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-10 text-center text-slate-600">
          Chưa có tài khoản?
          <Link to="/register" className="ml-2 font-bold text-emerald-700 hover:text-emerald-800">
            Đăng ký miễn phí
          </Link>
        </p>
      </div>
    </section>
  )
}
