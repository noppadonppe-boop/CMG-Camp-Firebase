"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Tent,
  ClipboardList,
  BedDouble,
  Users,
  BookOpen,
  Receipt,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  { label: "แดชบอร์ด", subLabel: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "จัดการแคมป์", subLabel: "Manage Camps", href: "/camps", icon: Tent },
  { label: "ลงทะเบียน", subLabel: "Registration", href: "/registration", icon: ClipboardList },
  { label: "ห้องพัก", subLabel: "Rooms", href: "/rooms", icon: BedDouble },
  { label: "ผู้มาติดต่อ", subLabel: "Visitors", href: "/visitors", icon: Users },
  { label: "ตรวจสุขอนามัย", subLabel: "Hygiene", href: "/hygiene", icon: ShieldCheck },
  { label: "ระบบบิล", subLabel: "Billing", href: "/billing", icon: Receipt },
  { label: "คู่มือการใช้งาน", subLabel: "User Manual", href: "/manual", icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-60 flex-col border-r border-gray-200 bg-white shadow-sm">
      <nav className="flex flex-col gap-1 p-3 pt-4">
        {navItems.map(({ label, subLabel, href, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-tight">{label}</p>
                <p className={`truncate text-[11px] leading-tight ${
                  isActive ? "text-white/70" : "text-gray-400"
                }`}>{subLabel}</p>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
