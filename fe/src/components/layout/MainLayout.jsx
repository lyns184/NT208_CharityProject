import { Outlet, useLocation } from "react-router-dom"
import Header from "./Header"
import Footer from "./UnifiedFooter"
import CampaignAssistant from "@/components/assistant/CampaignAssistant"

export default function MainLayout() {
  const { pathname } = useLocation()
  const isAuthPage = pathname === "/login" || pathname === "/register"
  const isHomePage = pathname === "/"
  const isMessagesPage = pathname === "/messages" || pathname.startsWith("/messages/")
  const isVideoFeedPage = pathname === "/videos"
  const mainClassName = isVideoFeedPage
    ? "flex-1 min-h-0 overflow-hidden"
    : isAuthPage || isHomePage
      ? "flex-1"
      : isMessagesPage
        ? "flex-1 overflow-hidden"
        : "flex-1 container mx-auto px-4 py-6"

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {!isVideoFeedPage && <Header />}
      <main className={mainClassName}>
        <Outlet />
      </main>
      {!(isAuthPage || isMessagesPage || isVideoFeedPage) && <Footer />}
      {!isAuthPage && <CampaignAssistant />}
    </div>
  )
}
