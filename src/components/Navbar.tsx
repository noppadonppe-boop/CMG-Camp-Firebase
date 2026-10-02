import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Building2, Check, User, LogOut, Menu, ArrowUpRight, Loader2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCamp } from "@/context/CampContext";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/lib/auth-service";

const PAGE_CONTEXT: Record<string, { section: string; title: string }> = {
  "/": { section: "พื้นที่ทำงาน", title: "ภาพรวมแคมป์" },
  "/camps": { section: "แคมป์และผู้พักอาศัย", title: "จัดการแคมป์" },
  "/registration": { section: "แคมป์และผู้พักอาศัย", title: "ลงทะเบียนผู้พัก" },
  "/rooms": { section: "แคมป์และผู้พักอาศัย", title: "ห้องพัก" },
  "/visitors": { section: "แคมป์และผู้พักอาศัย", title: "ผู้มาติดต่อ" },
  "/hygiene": { section: "การดำเนินงาน", title: "สุขอนามัย" },
  "/hygiene/inspect": { section: "สุขอนามัย", title: "ตรวจสุขอนามัย" },
  "/hygiene/history": { section: "สุขอนามัย", title: "ประวัติการตรวจ" },
  "/billing": { section: "การดำเนินงาน", title: "การเงิน" },
  "/billing/meter-readings": { section: "การเงิน", title: "บันทึกมิเตอร์" },
  "/billing/invoices": { section: "การเงิน", title: "ใบแจ้งหนี้" },
  "/admin/users": { section: "ระบบและการช่วยเหลือ", title: "จัดการผู้ใช้" },
  "/admin/announcements": { section: "ระบบและการช่วยเหลือ", title: "ประกาศระบบ" },
  "/manual": { section: "ระบบและการช่วยเหลือ", title: "คู่มือการใช้งาน" },
  "/profile": { section: "บัญชีผู้ใช้", title: "โปรไฟล์ของฉัน" },
};

interface NavbarProps { onMenuClick: () => void; mobileMenuOpen: boolean; }
export default function Navbar({ onMenuClick, mobileMenuOpen }: NavbarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { selectedCamp, setSelectedCamp, camps, loading } = useCamp();
  const { userProfile } = useAuth();
  const [campOpen, setCampOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const campRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const campTriggerRef = useRef<HTMLButtonElement>(null);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);
  const page = PAGE_CONTEXT[pathname] ?? { section: "พื้นที่ทำงาน", title: "CMG Camp Manager" };

  useEffect(() => { setCampOpen(false); setProfileOpen(false); }, [pathname]);
  useEffect(() => {
    if (!campOpen && !profileOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (!campRef.current?.contains(event.target)) setCampOpen(false);
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (campOpen) campTriggerRef.current?.focus();
      if (profileOpen) profileTriggerRef.current?.focus();
      setCampOpen(false); setProfileOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("pointerdown", onPointerDown); document.removeEventListener("keydown", onKeyDown); };
  }, [campOpen, profileOpen]);

  async function handleLogout() {
    setLoggingOut(true); setLogoutError("");
    try { await logout(); navigate("/login"); }
    catch { setLogoutError("ออกจากระบบไม่สำเร็จ กรุณาลองอีกครั้ง"); }
    finally { setLoggingOut(false); }
  }

  return <header className="app-navbar relative z-30 flex min-h-[96px] items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-8">
    <div className="flex min-w-0 items-center gap-3">
      <button type="button" onClick={onMenuClick} aria-label="เปิดเมนูหลัก" aria-controls="app-navigation" aria-expanded={mobileMenuOpen} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white bg-white/80 text-[#747091] shadow-sm focus-visible:outline-2 focus-visible:outline-[#8b73e8] lg:hidden"><Menu className="h-5 w-5" /></button>
      <div className="min-w-0">
        <nav aria-label="ตำแหน่งหน้าปัจจุบัน" className="mb-1.5 hidden items-center gap-1.5 text-[10px] font-medium text-[#a3a6bc] sm:flex"><Link to="/" className="transition hover:text-[#8b73df]">CMG</Link><ChevronRight className="h-3 w-3" /><span>{page.section}</span></nav>
        <p className="truncate text-sm font-semibold tracking-[-0.02em] text-[#484b6a] sm:text-base">{page.title}</p>
      </div>
    </div>
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      <div ref={campRef} className="relative">
        <button ref={campTriggerRef} type="button" onClick={() => { setCampOpen((value) => !value); setProfileOpen(false); }} aria-expanded={campOpen} aria-controls="camp-selector" aria-label={`เลือกแคมป์: ${selectedCamp?.name ?? "ยังไม่ได้เลือก"}`} className="flex h-10 items-center gap-2 rounded-full border border-[#e6e6f2] bg-white/85 px-3 text-xs font-medium text-[#737593] shadow-[0_3px_12px_-8px_#8277b6] transition hover:border-[#c7b8ef] focus-visible:outline-2 focus-visible:outline-[#8b73e8] sm:px-4">
          <Building2 className="h-4 w-4 shrink-0 text-[#a193d5]" strokeWidth={1.7} /><span className="max-w-[90px] truncate sm:max-w-[160px]">{loading ? "กำลังโหลด..." : selectedCamp?.name ?? "เลือกแคมป์"}</span><ChevronDown className={`h-3.5 w-3.5 shrink-0 text-[#a8a4ba] transition-transform ${campOpen ? "rotate-180" : ""}`} />
        </button>
        {campOpen && <div id="camp-selector" className="fixed left-4 right-4 top-[82px] z-50 mt-3 max-h-[60vh] overflow-y-auto sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:w-[280px] rounded-[22px] border border-[#eeebf7] bg-white p-2 shadow-[0_18px_60px_-20px_#68638d66]" role="group" aria-label="แคมป์ที่สามารถเลือกได้">
          <p className="px-3 py-2 text-[10px] font-medium text-[#aaa7bb]">เลือกพื้นที่ทำงาน</p>
          {loading ? <p className="px-3 py-3 text-xs text-[#9995b0]">กำลังโหลดข้อมูลแคมป์...</p> : camps.length === 0 ? <p className="px-3 py-3 text-xs text-[#9995b0]">ไม่มีข้อมูลแคมป์</p> : camps.map((camp) => <button key={camp.id} type="button" onClick={() => { setSelectedCamp(camp); setCampOpen(false); campTriggerRef.current?.focus(); }} aria-pressed={selectedCamp?.id === camp.id} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-xs transition focus-visible:outline-2 focus-visible:outline-[#8b73e8] ${selectedCamp?.id === camp.id ? "bg-[#f2eefc] text-[#876bcf]" : "text-[#73708c] hover:bg-[#f8f6fd]"}`}><Building2 className="h-4 w-4 shrink-0" strokeWidth={1.6} /><span className="min-w-0 flex-1 break-words">{camp.name}</span>{selectedCamp?.id === camp.id && <Check className="h-4 w-4 shrink-0" />}</button>)}
        </div>}
      </div>
      {userProfile && <div ref={profileRef} className="relative">
        <button ref={profileTriggerRef} type="button" onClick={() => { setProfileOpen((value) => !value); setCampOpen(false); }} aria-label={`เมนูบัญชี ${userProfile.firstName} ${userProfile.lastName}`} aria-expanded={profileOpen} aria-controls="profile-dropdown" className="flex h-10 items-center gap-2 rounded-full border border-white bg-white/80 p-1 pr-2 shadow-[0_3px_12px_-8px_#8277b6] transition hover:bg-[#f2eefc] focus-visible:outline-2 focus-visible:outline-[#8b73e8]">
          {userProfile.photoURL ? <img src={userProfile.photoURL} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#c6e5f0] to-[#d5caf3] text-[10px] font-bold text-[#7970a4]">{userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}</span>}
          <ChevronDown className={`h-3.5 w-3.5 text-[#a8a4ba] transition-transform ${profileOpen ? "rotate-180" : ""}`} />
        </button>
        {profileOpen && <div id="profile-dropdown" className="absolute right-0 z-50 mt-3 w-[min(280px,calc(100vw-32px))] overflow-hidden rounded-[22px] border border-[#eeebf7] bg-white p-2 shadow-[0_18px_60px_-20px_#68638d66]" role="group" aria-label="บัญชีผู้ใช้">
          <div className="mb-1 border-b border-[#f0edf8] px-3 pb-3 pt-2"><p className="break-words text-sm font-semibold text-[#50506e]">{userProfile.firstName} {userProfile.lastName}</p><p className="mt-1 break-all text-[11px] text-[#a09bad]">{userProfile.email}</p><p className="mt-2 break-words text-[10px] text-[#a192c8]">{userProfile.roles.join(" · ")}</p></div>
          <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-xs text-[#79728e] transition hover:bg-[#f7f4fc] focus-visible:outline-2 focus-visible:outline-[#8b73e8]"><User className="h-4 w-4" strokeWidth={1.7} />แก้ไขโปรไฟล์<ArrowUpRight className="ml-auto h-3.5 w-3.5 text-[#bbb3cc]" /></Link>
          <button type="button" onClick={handleLogout} disabled={loggingOut} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-xs text-[#df8493] transition hover:bg-[#fff3f5] focus-visible:outline-2 focus-visible:outline-[#df8493] disabled:opacity-60">{loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" strokeWidth={1.7} />}{loggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}</button>
          {logoutError && <p role="alert" className="px-3 pb-2 text-xs text-[#d57788]">{logoutError}</p>}
        </div>}
      </div>}
    </div>
  </header>;
}
