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
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Hồ sơ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messages" className="cursor-pointer">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Nhắn tin
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-campaigns" className="cursor-pointer">
                      <FolderHeart className="mr-2 h-4 w-4" />
                      Chiến dịch của tôi
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
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
            <SheetContent side="right" className="w-72">
              <SheetTitle className="flex items-center gap-2 mb-6">
                <Heart className="h-5 w-5 text-primary fill-primary" />
                OpenHeart
              </SheetTitle>
              <nav className="flex flex-col gap-3">
                {publicLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={navLinkClass}
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
                      className={navLinkClass}
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                <div className="border-t pt-3 mt-3">
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
                    <div className="flex flex-col gap-2">
                      {!isAdmin && (
                        <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => setOpen(false)}>
                          <Link to="/campaigns/create">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tạo chiến dịch
                          </Link>
                        </Button>
                      )}
                      <Link
                        to="/profile"
                        className="text-sm text-muted-foreground hover:text-primary"
                        onClick={() => setOpen(false)}
                      >
                        Hồ sơ
                      </Link>
                      <Link
                        to="/messages"
                        className="text-sm text-muted-foreground hover:text-primary"
                        onClick={() => setOpen(false)}
                      >
                        Nhắn tin
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="text-sm text-muted-foreground hover:text-primary"
                          onClick={() => setOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setOpen(false)
                          logout()
                        }}
                      >
                        Đăng xuất
                      </Button>
                    </div>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
