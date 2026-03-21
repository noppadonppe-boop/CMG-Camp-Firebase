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

  const isMasterAdmin = userProfile?.roles.includes("MasterAdmin");

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center px-5 border-b border-gray-100">
        <span className="text-base font-bold text-blue-600">CMG</span>
      </div>

      {/* User Profile Card */}
      {userProfile && (
        <div className="border-b border-gray-100 p-4">
          <div className="flex items-center gap-3">
            {userProfile.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={userProfile.firstName}
                className="h-12 w-12 rounded-full border-2 border-blue-200"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                {userProfile.firstName.charAt(0)}
                {userProfile.lastName.charAt(0)}
              </div>
            )}
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
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-3">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <NavLink
            key={href}
            to={href}
            end={href === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User Management (MasterAdmin only) */}
      {isMasterAdmin && (
        <div className="border-t border-gray-100 p-3">
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <div className="flex items-center gap-3">
              <UserCog className="h-4 w-4 shrink-0" />
              <span>จัดการผู้ใช้</span>
            </div>
            {pendingCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {pendingCount}
              </span>
            )}
          </NavLink>
        </div>
      )}
    </aside>
  );
}
