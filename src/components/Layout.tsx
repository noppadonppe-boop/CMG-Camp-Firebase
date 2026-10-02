import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import AppSidebar from "./Sidebar";
import AnnouncementPopup from "./AnnouncementPopup";

export default function Layout() {
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);
  return (
    <div className="app-shell flex min-h-screen bg-[#f5f7fd]">
      <a href="#main-content" className="sr-only z-[100] rounded-xl bg-white px-4 py-3 text-[#7c60d4] focus:not-sr-only focus:fixed focus:left-4 focus:top-4">ข้ามไปยังเนื้อหา</a>
      <AppSidebar mobileOpen={mobileMenuOpen} onMobileClose={closeMobileMenu} />
      <div className="app-main flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setMobileMenuOpen(true)} mobileMenuOpen={mobileMenuOpen} />
        <main id="main-content" tabIndex={-1} className="app-content relative flex-1 px-4 pb-8 pt-3 outline-none sm:px-6 lg:px-8 lg:pb-10"><Outlet /></main>
      </div>
      <AnnouncementPopup />
    </div>
  );
}
