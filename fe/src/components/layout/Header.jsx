import { Link, NavLink } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Heart,
  Menu,
  User,
  MessageSquare,
  LogOut,
  LayoutDashboard,
  FolderHeart,
  PlusCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const publicLinks = [
  { to: "/", label: "Trang chủ" },
  { to: "/organizers", label: "Cá nhân & Tổ chức" },
  { to: "/social", label: "Cộng đồng" },
  { to: "/campaigns", label: "Danh sách chiến dịch" },
]

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const authedLinks = [
    { to: "/my-campaigns", label: "Chiến dịch của tôi", icon: FolderHeart },
  ]

  const navLinkClass = ({ isActive }) =>
    cn(
      "text-sm font-medium transition-colors hover:text-primary",
      isActive ? "text-primary" : "text-muted-foreground"
    )

  const mobileNavLinkClass = ({ isActive }) =>
    cn(
      "rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
      isActive
        ? "bg-emerald-50 text-emerald-700"
        : "text-slate-700 hover:bg-slate-100"
    )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-6">
          <span className="text-xl font-extrabold text-[#064E3B]">OpenHeart</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 flex-1">
          {publicLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass} end={link.to === "/"}>
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated &&
            authedLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated && !isAdmin && (
              <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700">
                <Link to="/campaigns/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tạo chiến dịch
                </Link>
              </Button>
            )}

            {!isAuthenticated ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Đăng nhập</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Đăng ký</Link>
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-emerald-50">
                    <Avatar className="h-10 w-10 border-2 border-emerald-600">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-2xl shadow-lg border-slate-200">
                  {/* User Info Section */}
                  <div className="px-4 py-4 bg-linear-to-r from-emerald-50 to-emerald-50/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-emerald-200">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-lg">
                          {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator className="my-2" />
                  
                  {/* Menu Items */}
                  <DropdownMenuItem asChild className="px-4 py-2.5 rounded-lg mx-2 my-1 cursor-pointer hover:bg-emerald-50 transition-colors">
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-3 h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-slate-700">Hồ sơ</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="px-4 py-2.5 rounded-lg mx-2 my-1 cursor-pointer hover:bg-emerald-50 transition-colors">
                    <Link to="/messages" className="flex items-center">
                      <MessageSquare className="mr-3 h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-slate-700">Nhắn tin</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="px-4 py-2.5 rounded-lg mx-2 my-1 cursor-pointer hover:bg-emerald-50 transition-colors">
                    <Link to="/my-campaigns" className="flex items-center">
                      <FolderHeart className="mr-3 h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-slate-700">Chiến dịch của tôi</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="my-2" />
                      <DropdownMenuItem asChild className="px-4 py-2.5 rounded-lg mx-2 my-1 cursor-pointer hover:bg-blue-50 transition-colors">
                        <Link to="/admin/dashboard" className="flex items-center">
                          <LayoutDashboard className="mr-3 h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-slate-700">Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator className="my-2" />
                  
                  {/* Logout */}
                  <DropdownMenuItem onClick={logout} className="px-4 py-2.5 rounded-lg mx-2 my-1 cursor-pointer hover:bg-red-50 transition-colors">
                    <LogOut className="mr-3 h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(90vw,360px)] p-0">
              <div className="flex h-full flex-col">
                <div className="border-b px-5 py-4">
                  <SheetTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary fill-primary" />
                    OpenHeart
                  </SheetTitle>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Điều hướng
                  </div>
                  <nav className="flex flex-col gap-2">
                    {publicLinks.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        className={mobileNavLinkClass}
                        onClick={() => setOpen(false)}
                        end={link.to === "/"}
                      >
                        {link.label}
                      </NavLink>
                    ))}
                    {isAuthenticated &&
                      authedLinks.map((link) => (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          className={mobileNavLinkClass}
                          onClick={() => setOpen(false)}
                        >
                          {link.label}
                        </NavLink>
                      ))}
                  </nav>

                  <div className="mt-5 border-t pt-4">
                    {!isAuthenticated ? (
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" asChild onClick={() => setOpen(false)}>
                          <Link to="/login">Đăng nhập</Link>
                        </Button>
                        <Button asChild onClick={() => setOpen(false)}>
                          <Link to="/register">Đăng ký</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {!isAdmin && (
                          <Button
                            asChild
                            className="w-full justify-start bg-emerald-600 text-white shadow-md shadow-emerald-200 hover:bg-emerald-700"
                            onClick={() => setOpen(false)}
                          >
                            <Link to="/campaigns/create">
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Tạo chiến dịch
                            </Link>
                          </Button>
                        )}

                        <div className="rounded-xl bg-emerald-50 p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-emerald-200">
                              <AvatarImage src={user?.avatar} alt={user?.name} />
                              <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                                {user?.name?.charAt(0)?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                          </div>
                        </div>

                        <Link
                          to="/profile"
                          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-slate-700 hover:bg-emerald-50 transition-colors"
                          onClick={() => setOpen(false)}
                        >
                          <User className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium">Hồ sơ</span>
                        </Link>

                        <Link
                          to="/messages"
                          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-slate-700 hover:bg-emerald-50 transition-colors"
                          onClick={() => setOpen(false)}
                        >
                          <MessageSquare className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium">Nhắn tin</span>
                        </Link>

                        <Link
                          to="/my-campaigns"
                          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-slate-700 hover:bg-emerald-50 transition-colors"
                          onClick={() => setOpen(false)}
                        >
                          <FolderHeart className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium">Chiến dịch của tôi</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-slate-700 hover:bg-blue-50 transition-colors"
                            onClick={() => setOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">Admin Dashboard</span>
                          </Link>
                        )}

                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => {
                            setOpen(false)
                            logout()
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Đăng xuất
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
