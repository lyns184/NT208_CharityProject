import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { AuthProvider } from "@/contexts/AuthContext"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import ErrorBoundary from "@/components/shared/ErrorBoundary"
import ProtectedRoute from "@/components/shared/ProtectedRoute"
import AdminRoute from "@/components/shared/AdminRoute"
import MainLayout from "@/components/layout/MainLayout"
import AdminLayout from "@/components/layout/AdminLayout"

// Pages
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import NotFound from "@/pages/NotFound"
import Home from "@/pages/Home"
import Campaigns from "@/pages/Campaigns"
import Organizers from "@/pages/Organizers"
import CampaignDetail from "@/pages/CampaignDetail"
import CreateCampaign from "@/pages/CreateCampaign"
import MyCampaigns from "@/pages/MyCampaigns"
import DisbursementRequest from "@/pages/DisbursementRequest"
import Profile from "@/pages/Profile"
import Messages from "@/pages/Messages"
import Social from "@/pages/Social"
import SocialPostCreate from "@/pages/SocialPostCreate"
import SocialPostDetail from "@/pages/SocialPostDetail"
import AdminDashboard from "@/pages/admin/Dashboard"
import AdminKYC from "@/pages/admin/KYCManagement"
import AdminCampaigns from "@/pages/admin/CampaignApproval"
import AdminDisbursements from "@/pages/admin/DisbursementManagement"

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <TooltipProvider>
              <Routes>
                {/* Public routes with MainLayout */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/campaigns" element={<Campaigns />} />
                  <Route path="/campaigns/:id" element={<CampaignDetail />} />
                  <Route path="/organizers" element={<Organizers />} />
                  <Route path="/social" element={<Social />} />
                  <Route path="/social/:id" element={<SocialPostDetail />} />
                  <Route path="/profile/:profileID" element={<Profile />} />

                  {/* Protected user routes (still inside MainLayout) */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/campaigns/create" element={<CreateCampaign />} />
                    <Route path="/my-campaigns" element={<MyCampaigns />} />
                    <Route path="/my-campaigns/:id/disburse" element={<DisbursementRequest />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/messages/:userId" element={<Messages />} />
                    <Route path="/social/create" element={<SocialPostCreate />} />
                  </Route>
                </Route>

                {/* Admin routes with AdminLayout */}
                <Route element={<AdminRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/kyc" element={<AdminKYC />} />
                    <Route path="/admin/campaigns" element={<AdminCampaigns />} />
                    <Route path="/admin/disbursements" element={<AdminDisbursements />} />
                  </Route>
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster richColors position="top-right" />
            </TooltipProvider>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
