import { Outlet } from "react-router-dom"
import { useLocation } from "react-router-dom"
import Header from "./Header"
import Footer from "./UnifiedFooter"

export default function MainLayout() {
  const { pathname } = useLocation()
  const isAuthPage = pathname === "/login" || pathname === "/register"
  const isHomePage = pathname === "/"
  const isMessagesPage = pathname === "/messages" || pathname.startsWith("/messages/")
  const mainClassName = isAuthPage || isHomePage
    ? "flex-1"
    : isMessagesPage
    ? "flex-1 overflow-hidden"
    : "flex-1 container mx-auto px-4 py-6"

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className={mainClassName}>
        <Outlet />
      </main>
      {!(isAuthPage || isMessagesPage) && <Footer />}
    </div>
  )
}
