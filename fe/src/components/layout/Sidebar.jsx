import { NavLink, Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  UserCheck,
  FileCheck,
  Wallet,
  Heart,
  Home,
  User,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/kyc", label: "Duyệt KYC", icon: UserCheck },
  { to: "/admin/campaigns", label: "Duyệt chiến dịch", icon: FileCheck },
  { to: "/admin/disbursements", label: "Giải ngân", icon: Wallet },
]

export default function Sidebar({ onClose }) {
  const { logout } = useAuth()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <Heart className="h-6 w-6 text-primary fill-primary" />
        <span className="text-xl font-bold">Admin</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom links */}
      <div className="border-t px-3 py-4 space-y-1">
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground transition-colors"
        >
          <Home className="h-5 w-5" />
          Trang chủ
        </Link>
        <Link
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground transition-colors"
        >
          <User className="h-5 w-5" />
          Hồ sơ
        </Link>
        <button
          onClick={() => { onClose?.(); logout() }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Đăng xuất
        </button>
      </div>
    </div>
  )
}
