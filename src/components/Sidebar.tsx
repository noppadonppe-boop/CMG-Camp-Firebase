import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { LayoutDashboard, Building2, ClipboardList, BedDouble, Users, ShieldCheck, CreditCard, BookOpen, UserCog, ChevronLeft, ChevronRight, Megaphone, MountainSnow, X, type LucideIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCamp } from "@/context/CampContext";
import { useUsers } from "@/lib/db/useUsers";
import type { UserRole } from "@/types/auth";

const MANAGERS: UserRole[] = ["MasterAdmin", "MD", "GM", "CampBoss", "Manager"];
interface NavigationItem { href: string; icon: LucideIcon; label: string; roles?: UserRole[]; pendingUsers?: boolean; }
const NAVIGATION: { label: string; items: NavigationItem[] }[] = [
  { label: "ภาพรวม", items: [{ href: "/", icon: LayoutDashboard, label: "ภาพรวมแคมป์" }] },
  { label: "แคมป์และผู้พักอาศัย", items: [
    { href: "/camps", icon: Building2, label: "จัดการแคมป์", roles: MANAGERS },
    { href: "/registration", icon: ClipboardList, label: "ลงทะเบียนผู้พัก" },
    { href: "/rooms", icon: BedDouble, label: "ห้องพัก", roles: MANAGERS },
    { href: "/visitors", icon: Users, label: "ผู้มาติดต่อ", roles: [...MANAGERS, "HrManager", "Security"] },
  ] },
  { label: "การดำเนินงาน", items: [
    { href: "/hygiene", icon: ShieldCheck, label: "สุขอนามัย" },
    { href: "/billing", icon: CreditCard, label: "การเงิน", roles: [...MANAGERS, "Accountant"] },
  ] },
  { label: "ระบบและการช่วยเหลือ", items: [
    { href: "/admin/users", icon: UserCog, label: "จัดการผู้ใช้", roles: [...MANAGERS, "HrManager"], pendingUsers: true },
    { href: "/admin/announcements", icon: Megaphone, label: "ประกาศระบบ", roles: MANAGERS },
    { href: "/manual", icon: BookOpen, label: "คู่มือการใช้งาน" },
  ] },
];

// Only subscribe to approvals when the authorized management link is visible.
function PendingUsersBadge({ expanded }: { expanded: boolean }) {
  const { pendingCount } = useUsers();
  if (!pendingCount) return null;
  return <span className={`flex min-w-5 items-center justify-center rounded-full bg-[#ff8c9b] px-1.5 py-0.5 text-[10px] font-bold text-white ${expanded ? "ml-auto" : "absolute -right-1 -top-1"}`} aria-label={`ผู้ใช้รออนุมัติ ${pendingCount} คน`}>{pendingCount > 99 ? "99+" : pendingCount}</span>;
}

interface SidebarProps { mobileOpen: boolean; onMobileClose: () => void; }
export default function AppSidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { userProfile } = useAuth();
  const { selectedCamp } = useCamp();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  const sidebarRef = useRef<HTMLElement>(null);
  const expanded = mobileOpen || isExpanded;

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => { setIsDesktop(media.matches); if (media.matches) onMobileClose(); };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [onMobileClose]);

  useEffect(() => {
    if (!mobileOpen || isDesktop) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () => Array.from(sidebarRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []).filter((element) => element.getClientRects().length > 0);
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onMobileClose();
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); previousFocus?.focus(); };
  }, [mobileOpen, isDesktop, onMobileClose]);

  return <>
    {mobileOpen && !isDesktop && <div className="fixed inset-0 z-40 bg-[#202345]/30 backdrop-blur-sm lg:hidden" aria-hidden="true" onClick={onMobileClose} />}
    <aside ref={sidebarRef} id="app-navigation" role={mobileOpen && !isDesktop ? "dialog" : undefined} aria-modal={mobileOpen && !isDesktop ? true : undefined} aria-label="เมนูหลัก" aria-hidden={!isDesktop && !mobileOpen} inert={!isDesktop && !mobileOpen}
      className={`app-sidebar fixed inset-y-0 left-0 z-50 flex w-[264px] shrink-0 flex-col border-r border-white/80 bg-[#fafbff]/95 shadow-[8px_0_40px_-24px_#7774ae] backdrop-blur-xl transition-[width,transform] duration-300 motion-reduce:transition-none lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${isExpanded ? "lg:w-[248px]" : "lg:w-[86px]"}`}>
      <div className={`flex h-[100px] shrink-0 items-center ${expanded ? "gap-3 px-6" : "justify-center px-3"}`}>
        <Link to="/" onClick={onMobileClose} aria-label="CMG Camp Manager — ภาพรวมแคมป์" className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-[#8b73e8]">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b1ddf1] via-[#a5bcf2] to-[#8972df] text-white shadow-[0_5px_14px_#bcb8df66]"><MountainSnow className="h-7 w-7" strokeWidth={1.6} /></span>
          {expanded && <span className="min-w-0"><span className="block text-xl font-extrabold tracking-[-0.04em] text-[#252744]">CMG<span className="text-[#8b73df]">.</span></span><span className="block whitespace-nowrap text-[10px] font-medium tracking-[0.13em] text-[#9295ad]">CAMP MANAGER</span></span>}
        </Link>
        <button type="button" onClick={onMobileClose} aria-label="ปิดเมนู" className="ml-auto rounded-xl p-2 text-[#80839e] hover:bg-[#ece9fb] focus-visible:outline-2 focus-visible:outline-[#8b73e8] lg:hidden"><X className="h-5 w-5" /></button>
      </div>
      {expanded && <div className="mx-5 mb-4 rounded-2xl border border-[#e9e9f4] bg-white/70 p-3.5"><p className="mb-1.5 text-[10px] font-medium tracking-wider text-[#a0a2b6]">พื้นที่ทำงานปัจจุบัน</p><div className="flex items-center gap-2 text-xs font-semibold text-[#585b80]"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ab92eb]" /><span className="truncate">{selectedCamp?.name ?? "ยังไม่ได้เลือกแคมป์"}</span></div></div>}
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden pb-5 ${expanded ? "px-4" : "px-3"}`} aria-label="หน้าต่าง ๆ ของระบบ">
        {NAVIGATION.map((group) => {
          const visibleItems = group.items.filter((item) => !item.roles || userProfile?.roles.some((role) => item.roles!.includes(role)));
          if (!visibleItems.length) return null;
          return <div key={group.label} className="mb-5 last:mb-0">
            {expanded ? <p className="mb-2 px-3 text-[10px] font-semibold tracking-wide text-[#a0a2b8]">{group.label}</p> : <div className="mx-3 mb-3 border-t border-[#e8e9f4]" />}
            <div className="space-y-1.5">{visibleItems.map(({ href, icon: Icon, label, pendingUsers }) => <NavLink key={href} to={href} end={href === "/"} onClick={onMobileClose} title={!expanded ? label : undefined} aria-label={!expanded ? label : undefined}
              className={({ isActive }) => `group flex min-h-[45px] items-center rounded-2xl text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[#8b73e8] ${expanded ? "gap-3 px-3.5" : "justify-center px-2"} ${isActive ? "bg-gradient-to-r from-[#ece8fc] to-[#f1edff] text-[#7c60d4] shadow-[0_4px_12px_-8px_#8b73e8]" : "text-[#8689a1] hover:bg-[#f0eef9] hover:text-[#665d92]"}`}>
              <span className="relative flex h-6 w-6 shrink-0 items-center justify-center"><Icon className="h-[19px] w-[19px]" strokeWidth={1.7} />{pendingUsers && !expanded && <PendingUsersBadge expanded={false} />}</span>
              {expanded && <span className="truncate">{label}</span>}{pendingUsers && expanded && <PendingUsersBadge expanded />}
            </NavLink>)}</div>
          </div>;
        })}
      </nav>
      <div className={`shrink-0 border-t border-[#ececf5] ${expanded ? "p-4" : "p-3"}`}>
        {userProfile && <Link to="/profile" onClick={onMobileClose} aria-label="แก้ไขโปรไฟล์" title={!expanded ? `${userProfile.firstName} ${userProfile.lastName}` : undefined} className={`flex rounded-2xl border border-white bg-white/70 p-2.5 transition hover:bg-[#efecfa] focus-visible:outline-2 focus-visible:outline-[#8b73e8] ${expanded ? "items-center gap-2.5" : "justify-center"}`}>
          {userProfile.photoURL ? <img src={userProfile.photoURL} alt="" className="h-9 w-9 shrink-0 rounded-xl object-cover" /> : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ddd9fb] to-[#c4e9f4] text-xs font-bold text-[#7665b8]">{userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}</span>}
          {expanded && <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-[#454766]">{userProfile.firstName} {userProfile.lastName}</span><span className="mt-1 block truncate text-[10px] text-[#9597ad]">{userProfile.roles.join(" · ")}</span></span>}
          {expanded && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#a5a3ba]" />}
        </Link>}
        <button type="button" onClick={() => setIsExpanded((value) => !value)} aria-label={isExpanded ? "พับแถบเมนู" : "ขยายแถบเมนู"} aria-expanded={isExpanded} title={isExpanded ? "พับแถบเมนู" : "ขยายแถบเมนู"} className={`mt-3 hidden w-full items-center rounded-xl py-1.5 text-[#a4a2b8] transition hover:bg-[#efecfa] hover:text-[#8070bf] focus-visible:outline-2 focus-visible:outline-[#8b73e8] lg:flex ${expanded ? "gap-2 px-2.5 text-[10px]" : "justify-center"}`}>
          {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}{expanded && "พับแถบเมนู"}
        </button>
      </div>
    </aside>
  </>;
}
