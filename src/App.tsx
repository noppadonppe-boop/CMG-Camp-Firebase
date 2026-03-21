import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CampProvider } from "@/context/CampContext";
import Layout from "@/components/Layout";
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
import { useAutoSeed } from "@/lib/seed-firestore";

function AppInner() {
  useAutoSeed();
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <CampProvider>
        <AppInner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/camps" element={<CampsPage />} />
            <Route path="/registration" element={<RegistrationPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/visitors" element={<VisitorsPage />} />
            <Route path="/hygiene" element={<HygienePage />} />
            <Route path="/hygiene/inspect" element={<HygieneInspectPage />} />
            <Route path="/hygiene/history" element={<HygieneHistoryPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/billing/meter-readings" element={<BillingMeterReadingsPage />} />
            <Route path="/billing/invoices" element={<BillingInvoicesPage />} />
            <Route path="/manual" element={<ManualPage />} />
          </Route>
        </Routes>
      </CampProvider>
    </BrowserRouter>
  );
}
