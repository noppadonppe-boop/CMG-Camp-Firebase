import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CampProvider } from "@/context/CampContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import PendingApprovalPage from "@/pages/PendingApprovalPage";
import ProfilePage from "@/pages/ProfilePage";
import DashboardPage from "@/pages/DashboardPage";
import CampsPage from "@/pages/CampsPage";
import RegistrationPage from "@/pages/RegistrationPage";
import RoomsPage from "@/pages/RoomsPage";
import VisitorsPage from "@/pages/VisitorsPage";
import HygienePage from "@/pages/HygienePage";
import HygieneInspectPage from "@/pages/HygieneInspectPage";
import HygieneHistoryPage from "@/pages/HygieneHistoryPage";
import BillingPage from "@/pages/BillingPage";
import BillingMeterReadingsPage from "@/pages/BillingMeterReadingsPage";
import BillingInvoicesPage from "@/pages/BillingInvoicesPage";
import ManualPage from "@/pages/ManualPage";
import UserManagementPage from "@/pages/UserManagementPage";
import AnnouncementsAdminPage from "@/pages/admin/AnnouncementsAdminPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CampProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/pending" element={<PendingApprovalPage />} />

            {/* Protected routes */}
            <Route element={<Layout />}>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/camps"
                element={
                  <ProtectedRoute requireRoles={["MasterAdmin", "MD", "GM", "CampBoss", "Manager"]}>
                    <CampsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/registration"
                element={
                  <ProtectedRoute>
                    <RegistrationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rooms"
                element={
                  <ProtectedRoute requireRoles={["MasterAdmin", "MD", "GM", "CampBoss", "Manager"]}>
                    <RoomsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/visitors"
                element={
                  <ProtectedRoute requireRoles={["MasterAdmin", "MD", "GM", "HrManager", "CampBoss", "Manager", "Security"]}>
                    <VisitorsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hygiene"
                element={
                  <ProtectedRoute>
                    <HygienePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hygiene/inspect"
                element={
                  <ProtectedRoute requireRoles={["MasterAdmin", "MD", "GM", "CampBoss", "Manager", "Inspector"]}>
                    <HygieneInspectPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hygiene/history"
                element={
                  <ProtectedRoute>
                    <HygieneHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing"
                element={
                  <ProtectedRoute requireRoles={["MasterAdmin", "MD", "GM", "CampBoss", "Manager", "Accountant"]}>
                    <BillingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing/meter-readings"
                element={
                  <ProtectedRoute requireRoles={["MasterAdmin", "MD", "GM", "CampBoss", "Manager", "Accountant"]}>
                    <BillingMeterReadingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing/invoices"
                element={
                  <ProtectedRoute requireRoles={["MasterAdmin", "MD", "GM", "CampBoss", "Manager", "Accountant"]}>
                    <BillingInvoicesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manual"
                element={
                  <ProtectedRoute>
                    <ManualPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireRoles={["MasterAdmin", "MD", "GM", "HrManager", "CampBoss", "Manager"]}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/announcements"
                element={
                  <ProtectedRoute requireRoles={["MasterAdmin", "MD", "GM", "CampBoss", "Manager"]}>
                    <AnnouncementsAdminPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </CampProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
