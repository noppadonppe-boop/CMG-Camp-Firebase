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
} from "lucide-react";

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
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center px-5 border-b border-gray-100">
        <span className="text-base font-bold text-blue-600">CMG</span>
      </div>
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
    </aside>
  );
}
