import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  BedDouble,
  Users,
  ShieldCheck,
  CreditCard,
  BookOpen,
  UserCog,
  Shield,
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/lib/db/useUsers";

const NAV_ITEMS = [
  { href: "/",              icon: LayoutDashboard, label: "Dashboard" },
  { href: "/camps",         icon: Building2,       label: "จัดการแคมป์" },
  { href: "/registration",  icon: ClipboardList,   label: "ลงทะเบียน" },
  { href: "/rooms",         icon: BedDouble,       label: "ห้องพัก" },
  { href: "/visitors",      icon: Users,           label: "ผู้มาติดต่อ" },
  { href: "/hygiene",       icon: ShieldCheck,     label: "สุขอนามัย" },
  { href: "/billing",       icon: CreditCard,      label: "การเงิน" },
  { href: "/manual",        icon: BookOpen,        label: "คู่มือ" },
];

export default function AppSidebar() {
  const { userProfile } = useAuth();
  const { pendingCount } = useUsers();
  const [isExpanded, setIsExpanded] = useState(true);

  const canManageUsers = userProfile?.roles.some((role: string) => ["MasterAdmin", "MD", "GM", "HrManager", "CampBoss", "Manager"].includes(role));

  return (
    <aside className={`flex shrink-0 flex-col border-r border-gray-200 bg-white transition-all duration-300 ${isExpanded ? "w-60" : "w-16"}`}>
      <div className={`flex h-14 items-center border-b border-gray-100 ${isExpanded ? "px-5 justify-between" : "justify-center"}`}>
        {isExpanded && <span className="text-base font-bold text-blue-600">CMG</span>}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          title={isExpanded ? "พับแถบเมนู" : "ขยายแถบเมนู"}
        >
          {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* User Profile Card */}
      {userProfile && (
        <div className={`border-b border-gray-100 ${isExpanded ? "p-4" : "p-2 py-4 flex justify-center"}`}>
          <div className={`flex items-center ${isExpanded ? "gap-3" : "justify-center"}`}>
            {userProfile.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={userProfile.firstName}
                className="h-10 w-10 shrink-0 rounded-full border-2 border-blue-200"
                title={!isExpanded ? `${userProfile.firstName} ${userProfile.lastName}` : undefined}
              />
            ) : (
              <div 
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700"
                title={!isExpanded ? `${userProfile.firstName} ${userProfile.lastName}` : undefined}
              >
                {userProfile.firstName.charAt(0)}
                {userProfile.lastName.charAt(0)}
              </div>
            )}
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {userProfile.firstName} {userProfile.lastName}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {userProfile.roles.slice(0, 2).map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center gap-0.5 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
                    >
                      <Shield className="h-2.5 w-2.5" />
                      {role}
                    </span>
                  ))}
                  {userProfile.roles.length > 2 && (
                    <span className="text-xs text-gray-400">+{userProfile.roles.length - 2}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-3 overflow-x-hidden">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <NavLink
            key={href}
            to={href}
            end={href === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 py-2.5 text-sm font-medium transition ${isExpanded ? "px-4" : "px-0 justify-center"} ${
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-r-2 border-transparent"
              }`
            }
            title={!isExpanded ? label : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {isExpanded && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Management (CampBoss & Manager only) */}
      {canManageUsers && (
        <div className={`border-t border-gray-100 ${isExpanded ? "p-3 space-y-1" : "p-2 space-y-2"}`}>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center justify-between rounded-lg py-2.5 text-sm font-medium transition ${isExpanded ? "gap-3 px-3" : "px-0 justify-center"} ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
            title={!isExpanded ? "จัดการผู้ใช้" : undefined}
          >
            <div className={`flex items-center ${isExpanded ? "gap-3" : "justify-center relative w-full"}`}>
              <UserCog className="h-5 w-5 shrink-0" />
              {isExpanded && <span>จัดการผู้ใช้</span>}
              {!isExpanded && pendingCount > 0 && (
                <span className="absolute -top-1 right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </div>
            {isExpanded && pendingCount > 0 && (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {pendingCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/admin/announcements"
            className={({ isActive }) =>
              `flex items-center rounded-lg py-2.5 text-sm font-medium transition ${isExpanded ? "gap-3 px-3" : "px-0 justify-center"} ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
            title={!isExpanded ? "ประกาศระบบ" : undefined}
          >
            <div className={`flex items-center ${isExpanded ? "gap-3" : "justify-center w-full"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
              {isExpanded && <span>ประกาศระบบ</span>}
            </div>
          </NavLink>
        </div>
      )}
    </aside>
  );
}
