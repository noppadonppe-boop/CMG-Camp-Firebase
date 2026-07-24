import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import AppSidebar from "./Sidebar";
import AnnouncementPopup from "./AnnouncementPopup";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 p-6 relative">
          <Outlet />
        </main>
      </div>
      <AnnouncementPopup />
    </div>
  );
}
