import { useState, useMemo, useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Users, BedDouble, Bell, TrendingUp, ArrowUpRight, ArrowDownLeft,
  ArrowRight, X, Search, Home, Sparkles, Mars, Venus, MapPin,
  Activity, Clock3, ChartNoAxesColumnIncreasing, ChevronRight,
  ShieldCheck, BookOpen,
} from "lucide-react";
import { useCamp } from "@/context/CampContext";
import { useDashboard } from "@/lib/db/useDashboard";
import { useRooms, useZones } from "@/lib/db/useRooms";
import { useWorkers, type Worker } from "@/lib/db/useWorkers";

function getComputedStatus(room: { status: string; capacity: number }, residentsCount: number) {
  if (room.status === "maintenance") return "maintenance";
  if (room.status === "storage") return "storage";
  if (residentsCount === 0) return "empty";
  if (residentsCount >= room.capacity) return "full";
  return "partial";
}

function getWorkerLabel(w: Worker) {
  const sub = (w.subcontractor || "").toUpperCase();
  const role = (w.jobRole || "").toLowerCase();
  const subcontractorText = (w.subcontractor || "").toLowerCase();

  // ตรวจสอบว่าเป็นผู้อาศัยร่วม/ครอบครัวพนักงานหรือไม่
  const isFamily = 
    role.includes("ครอบครัว") || role.includes("ผู้ติดตาม") || role.includes("ผู้อาศัย") || 
    role.includes("ร่วมอาศัย") || role.includes("ญาติ") || role.includes("บุตร") || role.includes("ภรรยา") || role.includes("สามี") ||
    role.includes("family") || role.includes("dependent") || role.includes("resident") || 
    role.includes("follower") || role.includes("spouse") || role.includes("child") ||
    subcontractorText.includes("ครอบครัว") || subcontractorText.includes("ผู้ติดตาม") || subcontractorText.includes("ผู้อาศัย") || 
    subcontractorText.includes("ร่วมอาศัย") || subcontractorText.includes("ญาติ") || subcontractorText.includes("family") || 
    subcontractorText.includes("dependent") || subcontractorText.includes("resident") || subcontractorText.includes("follower");

  const isCMG = sub.includes("CMG") || sub === "DC" || w.employmentTypes?.dc;

  // หากเป็นผู้อาศัยร่วม/ครอบครัวพนักงาน
  if (isFamily) {
    // หากผู้อาศัยคนนั้นอยู่ร่วมกับ บ. CMG ก็จะเป็น FM แต่หากอยู่ร่วมกับผู้รับเหมาก็จะเป็น SUB
    return isCMG ? "FM" : "SUB";
  }

  if (isCMG) {
     // 1. ตรวจสอบสัญชาติเป็นหลักก่อน (ถ้าระบุไว้ และไม่เป็นค่า -)
     const nationality = (w.nationality || "").trim();
     if (nationality !== "" && nationality !== "-") {
       const nat = nationality.toLowerCase();
       const isThaiNationality = nat.includes("ไทย") || nat.includes("thai");
       return isThaiNationality ? "DC TH" : "DC FR";
     }

     // 2. ถ้าไม่มีข้อมูลสัญชาติ หรือใส่ค่า - ให้ตรวจสอบจากตัวอักษรของชื่อ
     const hasThai = /[ก-๛]/.test(w.firstName);
     const hasEnglish = /[A-Za-z]/.test(w.firstName);
     
     // ถ้าชื่อเป็นภาษาอังกฤษ (มีอักษรภาษาอังกฤษและไม่มีอักษรไทย) จะถูกจัดเป็น DC FR ทันที
     if (hasEnglish && !hasThai) {
       return "DC FR";
     }

     // นอกเหนือจากนั้น ให้เป็น DC TH
     return "DC TH";
  }
  return "SUB";
}

export default function DashboardClient() {
  const { selectedCamp } = useCamp();
  const { data, loading: dashboardLoading } = useDashboard(selectedCamp?.id ?? "");
  const { rooms, loading: roomsLoading } = useRooms();
  const { zones, loading: zonesLoading } = useZones();
  const { workers, loading: workersLoading } = useWorkers();

  // Drawer states
  const [drawerType, setDrawerType] = useState<"workers" | "rooms" | null>(null);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [drawerFilter, setDrawerFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!drawerType) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerType(null);
      if (event.key !== "Tab") return;
      const items = drawerRef.current?.querySelectorAll<HTMLElement>("button, input, a[href], [tabindex='0']");
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [drawerType]);

  useEffect(() => {
    setDrawerType(null);
    setSearchQuery("");
  }, [selectedCamp?.id]);

  const loading = dashboardLoading || roomsLoading || zonesLoading || workersLoading;

  // Camp-specific filterings
  const campZones = useMemo(() => zones.filter((z) => z.campId === selectedCamp?.id), [zones, selectedCamp]);
  const campZoneIds = useMemo(() => campZones.map((z) => z.id), [campZones]);
  const campRooms = useMemo(() => rooms.filter((r) => campZoneIds.includes(r.zoneId)), [rooms, campZoneIds]);
  const campWorkers = useMemo(() => workers.filter((w) => campZoneIds.includes(w.zoneId)), [workers, campZoneIds]);
  
  const zoneMap = useMemo(() => new Map(campZones.map((z) => [z.id, z.label])), [campZones]);
  const roomMap = useMemo(() => new Map(rooms.map((r) => [r.id, r.number])), [rooms]);

  // Resident groups count and gender stats
  const residentGroupStats = useMemo(() => {
    const statsObj = {
      "DC TH": { total: 0, male: 0, female: 0 },
      "DC FR": { total: 0, male: 0, female: 0 },
      "FM": { total: 0, male: 0, female: 0 },
      "SUB": { total: 0, male: 0, female: 0 },
    };

    campWorkers.forEach((w) => {
      const label = getWorkerLabel(w) as keyof typeof statsObj;
      if (statsObj[label]) {
        statsObj[label].total++;
        if (w.gender === "female") {
          statsObj[label].female++;
        } else {
          statsObj[label].male++;
        }
      }
    });

    return statsObj;
  }, [campWorkers]);

  // Enrich rooms with resident counts and computed status
  const enrichedRooms = useMemo(() => {
    return campRooms.map((room) => {
      const roomResidents = campWorkers.filter((w) => w.roomId === room.id);
      const computedStatus = getComputedStatus(room, roomResidents.length);
      return {
        ...room,
        residents: roomResidents,
        computedStatus,
      };
    });
  }, [campRooms, campWorkers]);

  // Filter drawer items
  const drawerItems = useMemo(() => {
    if (!drawerType) return [];

    if (drawerType === "workers") {
      let filtered = campWorkers;
      
      // Filter by resident group if selected
      if (["DC_TH", "DC_FR", "FM", "SUB"].includes(drawerFilter)) {
        const targetLabel = drawerFilter.replace("_", " "); // "DC TH" etc
        filtered = filtered.filter((w) => getWorkerLabel(w) === targetLabel);
      } else if (drawerFilter === "present") {
        // Keeps all workers since they are in-camp (or default list)
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (w) =>
            w.firstName.toLowerCase().includes(q) ||
            w.lastName.toLowerCase().includes(q) ||
            w.jobRole.toLowerCase().includes(q) ||
            w.subcontractor.toLowerCase().includes(q) ||
            (roomMap.get(w.roomId) || "").toLowerCase().includes(q)
        );
      }
      return filtered;
    } else {
      let filtered = enrichedRooms;
      if (drawerFilter === "roomsOccupied") {
        filtered = filtered.filter((r) => r.computedStatus === "partial" || r.computedStatus === "full");
      } else if (drawerFilter === "alerts") {
        filtered = filtered.filter((r) => r.computedStatus === "maintenance");
      } else if (drawerFilter === "empty") {
        filtered = filtered.filter((r) => r.computedStatus === "empty");
      } else if (drawerFilter === "partial") {
        filtered = filtered.filter((r) => r.computedStatus === "partial");
      } else if (drawerFilter === "full") {
        filtered = filtered.filter((r) => r.computedStatus === "full");
      } else if (drawerFilter === "maintenance") {
        filtered = filtered.filter((r) => r.computedStatus === "maintenance");
      } else if (drawerFilter === "storage") {
        filtered = filtered.filter((r) => r.computedStatus === "storage");
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.number.toLowerCase().includes(q) ||
            (zoneMap.get(r.zoneId) || "").toLowerCase().includes(q) ||
            r.residents.some(
              (res) =>
                res.firstName.toLowerCase().includes(q) || res.lastName.toLowerCase().includes(q)
            )
        );
      }
      return filtered;
    }
  }, [drawerType, drawerFilter, campWorkers, enrichedRooms, searchQuery, zoneMap, roomMap]);

  function openDrawer(type: "workers" | "rooms", title: string, filterVal: string) {
    setDrawerType(type);
    setDrawerTitle(title);
    setDrawerFilter(filterVal);
    setSearchQuery("");
  }

    if (loading) {
    return (
      <div className="dash-loading space-y-5" role="status" aria-label="กำลังโหลดภาพรวมแคมป์">
        <div className="dash-card relative overflow-hidden rounded-[28px] border border-white bg-gradient-to-br from-sky-50 via-white to-violet-50 px-7 py-10 sm:px-10">
          <p className="dash-eyebrow text-[10px] font-semibold tracking-[0.2em] text-violet-500">CMG CAMP MANAGER</p>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">กำลังเตรียมภาพรวมแคมป์</h1>
          <p className="mt-2 text-sm text-slate-500">เชื่อมต่อข้อมูลผู้พักอาศัยและห้องพักของคุณ</p>
          <div className="mt-8 h-2 w-44 animate-pulse rounded-full bg-violet-100" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-hidden="true">
          {[0, 1, 2, 3].map((item) => <div key={item} className="dash-card h-32 animate-pulse rounded-[22px] border border-white bg-white/70" />)}
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]" aria-hidden="true">
          <div className="dash-card h-72 animate-pulse rounded-[26px] bg-white/70" />
          <div className="dash-card h-72 animate-pulse rounded-[26px] bg-white/70" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <section className="dash-card relative flex min-h-[450px] flex-col items-center justify-center overflow-hidden rounded-[30px] border border-white bg-gradient-to-br from-sky-50 via-white to-violet-50 px-6 py-12 text-center">
        <div className="mb-7 h-36 w-36 overflow-hidden rounded-full border-8 border-white/75 shadow-[0_16px_40px_-15px_rgba(112,100,192,0.35)]">
          <img src="/images/camp-mountains.png" alt="" className="h-full w-full object-cover" />
        </div>
        <p className="dash-eyebrow text-[10px] font-semibold tracking-[0.2em] text-violet-500">YOUR CAMP, AT A GLANCE</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">{selectedCamp ? "ยังไม่มีข้อมูลภาพรวมแคมป์นี้" : "เลือกแคมป์เพื่อเริ่มต้น"}</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">{selectedCamp ? "ข้อมูลจะแสดงที่นี่เมื่อมีผู้พักอาศัยและห้องพักในระบบ" : "เลือกแคมป์จากเมนูด้านบน เพื่อดูข้อมูลผู้พักอาศัย ห้องพัก และความเคลื่อนไหว"}</p>
      </section>
    );
  }

  const { stats, logs, chartData } = data;
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);
  const occupancyPercent = stats.roomsTotal > 0 ? Math.round((stats.roomsOccupied / stats.roomsTotal) * 100) : 0;
  const maxGroupCount = Math.max(...Object.values(residentGroupStats).map((group) => group.total), 1);
  const residentGroups = [
    { label: "DC TH", filter: "DC_TH", subtitle: "CMG · คนไทย", gradient: "from-[#c7b9f5] to-[#9277e8]" },
    { label: "DC FR", filter: "DC_FR", subtitle: "CMG · ต่างชาติ", gradient: "from-[#a79bf7] to-[#6e5ce1]" },
    { label: "FM", filter: "FM", subtitle: "ครอบครัว / ผู้อาศัยร่วม", gradient: "from-[#c3a2ef] to-[#9870d9]" },
    { label: "SUB", filter: "SUB", subtitle: "ผู้รับเหมา", gradient: "from-[#a6bbf3] to-[#7b7dda]" },
  ] as const;
  const roomStatuses = [
    { key: "empty", label: "ห้องว่าง", subtitle: "พร้อมเข้าพัก", dot: "bg-[#8bcbbd]", text: "text-[#398a78]", background: "bg-[#eff9f6]" },
    { key: "partial", label: "มีผู้อยู่บางส่วน", subtitle: "ยังมีพื้นที่ว่าง", dot: "bg-[#b2a0eb]", text: "text-[#8262c8]", background: "bg-[#f4f0fc]" },
    { key: "full", label: "ห้องเต็ม", subtitle: "ครบจำนวนผู้พัก", dot: "bg-[#efaca9]", text: "text-[#cd7774]", background: "bg-[#fff3f1]" },
    { key: "maintenance", label: "ปิดซ่อมบำรุง", subtitle: "อยู่ระหว่างดูแล", dot: "bg-[#a6b4cb]", text: "text-[#687b99]", background: "bg-[#f1f5fa]" },
    { key: "storage", label: "ห้องเก็บของ", subtitle: "จัดเก็บอุปกรณ์", dot: "bg-[#909cdd]", text: "text-[#6774b9]", background: "bg-[#f0f2fc]" },
  ] as const;

  return (
    <div className="dash-page space-y-5 pb-2 sm:space-y-6">
      <section className="dash-hero relative isolate grid gap-5 overflow-hidden rounded-[30px] border border-white/90 bg-gradient-to-br from-[#edf7ff] via-[#f9fbff] to-[#f2effd] px-6 py-8 sm:px-9 md:grid-cols-[1.15fr_1fr] md:items-center lg:px-10 lg:py-9">
        <div className="relative z-10 max-w-lg">
          <p className="dash-eyebrow flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-[#8291b0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#a992ed]" /> CAMP OVERVIEW
          </p>
          <h1 className="dash-title mt-4 text-[30px] font-semibold leading-[1.35] tracking-tight text-[#192743] sm:text-[38px] lg:text-[42px]">ดูแลทุกการพักอาศัย<br />ให้เป็นเรื่องง่าย</h1>
          <p className="mt-4 max-w-md text-[13px] leading-7 text-[#6f7c95]">ภาพรวมผู้พักอาศัย ห้องพัก และความเคลื่อนไหว<br className="hidden sm:block" />ของแคมป์คุณ ในพื้นที่เดียวที่จัดการได้อย่างลงตัว</p>
          <div className="mt-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white bg-white/75 px-3 py-1.5 text-[11px] font-medium text-[#65718d] shadow-sm">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#9b86da]" /><span className="truncate">{selectedCamp?.name || "แคมป์ที่เลือก"}</span>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => openDrawer("workers", "ผู้พักอาศัยทั้งหมด", "totalWorkers")} className="dash-primary-action inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#8670e8] to-[#a28bec] px-5 py-3 text-[12px] font-medium text-white shadow-[0_8px_20px_-8px_rgba(129,99,220,0.7)] transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-500">
              ดูผู้พักอาศัย <ArrowUpRight className="h-4 w-4" />
            </button>
            <Link to="/registration" className="dash-secondary-action inline-flex items-center gap-2 rounded-full border border-white bg-white/80 px-5 py-3 text-[12px] font-medium text-[#7b729b] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-500">ลงทะเบียน <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        </div>
        <div className="dash-hero-art relative mx-auto h-[285px] w-full max-w-[370px] sm:h-[315px] md:h-[315px] lg:h-[340px]" aria-hidden="true">
          <div className="absolute right-1 top-3 h-28 w-28 rounded-full bg-gradient-to-br from-[#ffd4c9]/90 to-[#f6b8b7]/50 blur-[1px]" />
          <div className="dash-scenic-orbit absolute right-3 top-6 h-[250px] w-[250px] overflow-hidden rounded-[48%_48%_44%_44%] bg-[#d8eafb] shadow-[0_20px_45px_-20px_rgba(118,116,180,0.45)] sm:h-[280px] sm:w-[280px] lg:h-[305px] lg:w-[305px]">
            <img src="/images/camp-mountains.png" alt="" className="h-full w-full object-cover" />
          </div>
          <div className="absolute right-0 top-12 flex h-10 w-10 items-center justify-center rounded-full border-[5px] border-[#ffdbd2] bg-[#f6b9b7] text-white shadow-md"><MapPin className="h-4 w-4" /></div>
          <div className="dash-floating-card absolute bottom-2 left-0 w-[150px] rounded-[18px] border border-white bg-white/95 p-4 shadow-[0_14px_38px_-12px_rgba(113,111,167,0.35)] sm:bottom-4 sm:w-[165px] lg:bottom-1">
            <div className="flex items-center justify-between"><span className="text-[9px] font-medium text-[#8690a7]">การใช้ห้องพัก</span><BedDouble className="h-3.5 w-3.5 text-[#ac9adb]" /></div>
            <p className="mt-2 text-[32px] font-semibold leading-none tracking-tight text-[#23314d]">{occupancyPercent}<span className="ml-0.5 text-lg">%</span></p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#f0ebfb]"><div className="h-full rounded-full bg-gradient-to-r from-[#8c75e4] to-[#b397ed]" style={{ width: `${occupancyPercent}%` }} /></div>
            <p className="mt-2.5 text-[9px] text-[#949bb0]">{stats.roomsOccupied} จาก {stats.roomsTotal} ห้อง</p>
          </div>
          <div className="absolute bottom-2 right-4 rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-[9px] text-[#7e87a0] backdrop-blur-sm">CMG · Camp living, connected</div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={<Users className="h-4.5 w-4.5" />} label="ผู้พักอาศัยทั้งหมด" value={stats.totalWorkers} unit="คน" subtitle="ข้อมูลผู้พักอาศัยในระบบ" tone="violet" onClick={() => openDrawer("workers", "ผู้พักอาศัยทั้งหมด", "totalWorkers")} />
        <StatCard icon={<TrendingUp className="h-4.5 w-4.5" />} label="อยู่ในแคมป์" value={stats.present} unit="คน" subtitle="ผู้พักอาศัยของแคมป์นี้" tone="blue" onClick={() => openDrawer("workers", "ผู้พักอาศัยในแคมป์", "present")} />
        <StatCard icon={<BedDouble className="h-4.5 w-4.5" />} label="ห้องที่มีผู้พัก" value={stats.roomsOccupied} unit={`/ ${stats.roomsTotal}`} subtitle="จากห้องพักทั้งหมด" tone="lavender" onClick={() => openDrawer("rooms", "ห้องพักที่มีผู้พักอาศัย", "roomsOccupied")} />
        <StatCard icon={<Bell className="h-4.5 w-4.5" />} label="แจ้งเตือนดูแลห้อง" value={stats.alerts} unit="ห้อง" subtitle="ห้องที่ปิดซ่อมบำรุง" tone="coral" onClick={() => openDrawer("rooms", "ห้องพักปิดซ่อมบำรุง", "alerts")} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="dash-card rounded-[26px] border border-white/90 bg-white/85 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div><p className="dash-eyebrow text-[9px] font-semibold tracking-[0.16em] text-[#a3aabd]">OUR COMMUNITY</p><h2 className="mt-2 text-[17px] font-semibold text-[#28344f]">กลุ่มผู้พักอาศัย</h2></div>
            <span className="rounded-full bg-[#f5f2fc] px-3 py-1.5 text-[10px] text-[#8b7bab]">{campWorkers.length.toLocaleString("th-TH")} คน</span>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-2 sm:gap-4">
            {residentGroups.map((group) => {
              const groupStats = residentGroupStats[group.label];
              return <GroupBreakdownCard key={group.label} label={group.label} subLabel={group.subtitle} value={groupStats.total} percent={campWorkers.length > 0 ? Math.round((groupStats.total / campWorkers.length) * 100) : 0} maleCount={groupStats.male} femaleCount={groupStats.female} height={groupStats.total > 0 ? Math.max((groupStats.total / maxGroupCount) * 116, 8) : 0} gradient={group.gradient} onClick={() => openDrawer("workers", `กลุ่มผู้พักอาศัย: ${group.subtitle} [${group.label}]`, group.filter)} />;
            })}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-[#f0eff6] pt-4 text-[10px] text-[#9ba2b4]"><span>แตะกลุ่มเพื่อดูรายชื่อผู้พักอาศัย</span><span className="inline-flex items-center gap-1.5"><Mars className="h-3 w-3 text-[#8c9dd2]" /> ชาย <Venus className="ml-1 h-3 w-3 text-[#d5a1bf]" /> หญิง</span></div>
        </section>

        <section className="dash-card relative overflow-hidden rounded-[26px] border border-white/90 bg-white/85 p-5 sm:p-6">
          <p className="dash-eyebrow text-[9px] font-semibold tracking-[0.16em] text-[#a3aabd]">ROOM OCCUPANCY</p>
          <div className="mt-2 flex items-center justify-between"><h2 className="text-[17px] font-semibold text-[#28344f]">พื้นที่พักอาศัย</h2><Home className="h-4 w-4 text-[#b4a5d8]" /></div>
          <button type="button" onClick={() => openDrawer("rooms", "ห้องพักที่มีผู้พักอาศัย", "roomsOccupied")} className="relative mx-auto mt-2 block h-[192px] w-[192px] rounded-full transition hover:scale-[1.025] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400" aria-label={`ดูห้องพักที่มีผู้พักอาศัย ${stats.roomsOccupied} ห้อง คิดเป็น ${occupancyPercent} เปอร์เซ็นต์`}>
            <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" aria-hidden="true"><defs><linearGradient id="dashOccupancyGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#8e79e3" /><stop offset="100%" stopColor="#c6b1f4" /></linearGradient></defs><circle cx="100" cy="100" r="78" fill="none" stroke="#f0edf9" strokeWidth="8" /><circle cx="100" cy="100" r="78" fill="none" stroke="url(#dashOccupancyGradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray={2 * Math.PI * 78} strokeDashoffset={2 * Math.PI * 78 * (1 - occupancyPercent / 100)} className="transition-all duration-700" /></svg>
            <span className="absolute inset-0 flex flex-col items-center justify-center"><strong className="text-[39px] font-semibold tracking-tight text-[#29334f]">{occupancyPercent}<span className="text-xl">%</span></strong><span className="mt-1 text-[10px] text-[#98a0b3]">ห้องที่มีผู้พักอาศัย</span></span>
          </button>
          <div className="grid grid-cols-2 gap-3 border-t border-[#f0eff6] pt-4">
            <button type="button" className="group text-left focus-visible:outline-2 focus-visible:outline-violet-400" onClick={() => openDrawer("rooms", "ห้องพักว่าง", "empty")}><p className="text-[10px] text-[#9aa3b4]">พร้อมเข้าพัก</p><p className="mt-1 text-[20px] font-semibold text-[#5d978c]">{stats.roomBreakdown.empty} <span className="text-[10px] font-normal text-[#a2abba]">ห้อง</span><ChevronRight className="ml-2 inline h-3.5 w-3.5 text-[#b1c9c3] transition group-hover:translate-x-1" /></p></button>
            <div className="border-l border-[#efedf7] pl-5"><p className="text-[10px] text-[#9aa3b4]">ห้องพักทั้งหมด</p><p className="mt-1 text-[20px] font-semibold text-[#5e6784]">{stats.roomsTotal} <span className="text-[10px] font-normal text-[#a2abba]">ห้อง</span></p></div>
          </div>
        </section>
      </div>

      <section className="dash-card rounded-[26px] border border-white/90 bg-white/85 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3"><div><p className="dash-eyebrow text-[9px] font-semibold tracking-[0.16em] text-[#a3aabd]">ROOM STATUS</p><h2 className="mt-2 text-[17px] font-semibold text-[#28344f]">ทุกห้องพัก ในมุมมองเดียว</h2></div><span className="text-[11px] text-[#a0a7b7]">{stats.roomsTotal} ห้อง</span></div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {roomStatuses.map((status) => <MiniBreakdownCard key={status.key} label={status.label} subtitle={status.subtitle} value={stats.roomBreakdown[status.key]} percent={stats.roomsTotal > 0 ? Math.round((stats.roomBreakdown[status.key] / stats.roomsTotal) * 100) : 0} background={status.background} textColor={status.text} dotBg={status.dot} onClick={() => openDrawer("rooms", `ห้องพัก: ${status.label}`, status.key)} />)}
        </div>
        <div className="mt-5 flex h-2 w-full overflow-hidden rounded-full bg-[#f2f0f8]" aria-label="สัดส่วนสถานะห้องพัก">
          {roomStatuses.map((status) => <div key={status.key} className={`${status.dot} transition-all duration-500`} style={{ width: `${stats.roomsTotal > 0 ? (stats.roomBreakdown[status.key] / stats.roomsTotal) * 100 : 0}%` }} title={`${status.label} ${stats.roomBreakdown[status.key]} ห้อง`} />)}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <section className="dash-card rounded-[26px] border border-white/90 bg-white/85 p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><p className="dash-eyebrow text-[9px] font-semibold tracking-[0.16em] text-[#a3aabd]">LATEST ACTIVITY</p><h2 className="mt-2 text-[17px] font-semibold text-[#28344f]">ความเคลื่อนไหวล่าสุด</h2></div><Clock3 className="h-4 w-4 text-[#b5adce]" /></div>
          {logs.length === 0 ? <EmptyState icon={<Activity className="h-5 w-5" />} title="ยังไม่มีรายการเข้า–ออก" detail="รายการล่าสุดจะแสดงที่นี่เมื่อมีข้อมูลในระบบ" /> : (
            <div className="mt-5 overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-[#f0eef6] text-[9px] font-medium text-[#a0a6b7]"><th className="pb-3 font-medium">ผู้พักอาศัย</th><th className="pb-3 text-center font-medium">รายการ</th><th className="pb-3 text-right font-medium">เวลา</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id} className="border-b border-[#f5f3f9] last:border-0"><td className="py-3 pr-3"><div className="flex items-center gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${log.avatarColor}`}>{log.initials}</span><div><p className="text-[11px] font-medium text-[#4b5670]">{log.name}</p><p className="mt-0.5 text-[9px] text-[#a1a8b8]">{log.role}</p></div></div></td><td className="py-3 text-center"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] ${log.direction === "In" ? "bg-[#eff8f5] text-[#6eaa9b]" : "bg-[#fff1f0] text-[#ce918f]"}`}>{log.direction === "In" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}{log.direction === "In" ? "เข้า" : "ออก"}</span></td><td className="whitespace-nowrap py-3 text-right text-[10px] text-[#929bb0]">{log.time}</td></tr>)}</tbody></table></div>
          )}
        </section>
        <section className="dash-card rounded-[26px] border border-white/90 bg-white/85 p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><p className="dash-eyebrow text-[9px] font-semibold tracking-[0.16em] text-[#a3aabd]">DAILY MOVEMENT</p><h2 className="mt-2 text-[17px] font-semibold text-[#28344f]">ปริมาณเข้า–ออกรายวัน</h2></div><ChartNoAxesColumnIncreasing className="h-4 w-4 text-[#b5adce]" /></div>
          {chartData.length === 0 ? <EmptyState icon={<ChartNoAxesColumnIncreasing className="h-5 w-5" />} title="ยังไม่มีข้อมูลสำหรับกราฟ" detail="ดูแนวโน้มการเข้า–ออกเมื่อมีการบันทึกข้อมูล" /> : (
            <div className="mt-6 flex h-[190px] items-end gap-3 border-b border-[#ece8f6] px-1 pb-0 sm:gap-4">{chartData.map((day) => <div key={day.day} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"><span className="mb-2 text-[10px] text-[#9487b6]">{day.count}</span><div className="w-full max-w-9 rounded-t-md bg-gradient-to-t from-[#8c75e5] to-[#bc9fe9] transition-all duration-500" style={{ height: `${(day.count / maxCount) * 140}px`, minHeight: day.count > 0 ? "5px" : "0px" }} /><span className="mt-2 pb-2 text-[9px] text-[#9da3b5]">{day.day}</span></div>)}</div>
          )}
        </section>
      </div>
      <div className="flex flex-col gap-3 rounded-[22px] border border-white/80 bg-gradient-to-r from-[#f1eefb] via-white/80 to-[#fff1ee] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#a193c7]"><Sparkles className="h-4 w-4" /></span><div><p className="text-[12px] font-medium text-[#66718b]">ดูแลความเป็นอยู่ให้พร้อมทุกวัน</p><p className="mt-0.5 text-[10px] text-[#a0a5b5]">สุขอนามัยที่ดี เริ่มจากการดูแลแคมป์อย่างสม่ำเสมอ</p></div></div>
        <div className="flex items-center gap-3"><Link to="/manual" className="inline-flex items-center gap-1.5 text-[10px] text-[#9a92af] transition hover:text-[#736190]"><BookOpen className="h-3 w-3" /> คู่มือการใช้งาน</Link><Link to="/hygiene" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#edb0b7] to-[#f6c3ae] px-4 py-2.5 text-[10px] font-medium text-white shadow-sm transition hover:-translate-y-0.5"><ShieldCheck className="h-3.5 w-3.5" /> ดูสุขอนามัย <ArrowRight className="h-3 w-3" /></Link></div>
      </div>

      {drawerType && (
        <div className="dash-drawer fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="dash-drawer-title">
          <div className="absolute inset-0 bg-[#292641]/25 backdrop-blur-[5px]" onClick={() => setDrawerType(null)} aria-hidden="true" />
          <div ref={drawerRef} className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col border-l border-white bg-[#fafbff] shadow-2xl">
            <div className="border-b border-[#eeedf7] bg-white/80 px-5 py-6 sm:px-7">
              <div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-semibold tracking-[0.18em] text-[#aba1c0]">CAMP DETAILS</p><h2 id="dash-drawer-title" className="mt-2 text-[17px] font-semibold leading-relaxed text-[#303b57]">{drawerTitle}</h2><p className="mt-1 text-[11px] text-[#9ba3b5]">ทั้งหมด {drawerItems.length} รายการ</p></div><button type="button" onClick={() => setDrawerType(null)} className="rounded-full bg-[#f2effa] p-2 text-[#9587b1] transition hover:bg-[#e9e2f7] focus-visible:outline-2 focus-visible:outline-violet-400" aria-label="ปิดรายละเอียด"><X className="h-4 w-4" /></button></div>
              <div className="relative mt-5"><Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#b4abca]" /><input type="text" className="w-full rounded-2xl border border-[#eae7f4] bg-white py-3 pl-10 pr-10 text-[12px] text-[#596580] outline-none transition placeholder:text-[#b4b3c4] focus:border-[#b4a0e0] focus:ring-2 focus:ring-[#eee7fb]" placeholder={drawerType === "workers" ? "ค้นหาชื่อ ตำแหน่ง ผู้รับเหมา หรือห้อง" : "ค้นหาเลขห้อง โซน หรือชื่อผู้พัก"} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} aria-label={drawerType === "workers" ? "ค้นหาผู้พักอาศัย" : "ค้นหาห้องพัก"} />{searchQuery && <button type="button" onClick={() => setSearchQuery("")} className="absolute right-3 top-3.5 text-[#aea3c3] hover:text-[#8b73bb]" aria-label="ล้างคำค้นหา"><X className="h-4 w-4" /></button>}</div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-5 sm:p-6">
              {drawerItems.length === 0 ? <EmptyState icon={<Search className="h-5 w-5" />} title="ไม่พบข้อมูลที่ตรงกับเงื่อนไข" detail="ลองใช้คำค้นหาอื่น หรือตรวจสอบกลุ่มที่เลือก" /> : drawerType === "workers" ? (drawerItems as typeof campWorkers).map((worker) => (
                <article key={worker.id} className="flex items-start gap-3 rounded-[20px] border border-[#eeebf7] bg-white p-4 shadow-[0_5px_16px_-12px_rgba(101,86,155,0.25)]"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e8e1fa] to-[#e6eefb] text-[12px] font-semibold text-[#9987c4]">{worker.firstName.charAt(0)}{worker.lastName.charAt(0)}</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h3 className="truncate text-[12px] font-semibold text-[#4c5772]">{worker.firstName} {worker.lastName}</h3><span className="shrink-0 rounded-full bg-[#f4f0fb] px-2 py-0.5 text-[8px] text-[#a08dc0]">{getWorkerLabel(worker)}</span></div><p className="mt-1 truncate text-[10px] text-[#a0a8b8]">{worker.jobRole} · {worker.subcontractor}</p><div className="mt-3 flex flex-wrap gap-1.5"><span className="inline-flex items-center gap-1 rounded-full bg-[#f2f4fc] px-2 py-1 text-[9px] text-[#8d96b4]"><BedDouble className="h-3 w-3" /> {worker.roomId ? `ห้อง ${roomMap.get(worker.roomId) || "-"}` : "ยังไม่ได้จัดห้อง"}</span><span className="rounded-full bg-[#f7f5fb] px-2 py-1 text-[9px] text-[#a299b2]">โซน {zoneMap.get(worker.zoneId) || "-"}</span></div></div></article>
              )) : (drawerItems as typeof enrichedRooms).map((room) => {
                const status = roomStatuses.find((item) => item.key === room.computedStatus) || roomStatuses[0];
                return <article key={room.id} className="rounded-[20px] border border-[#eeebf7] bg-white p-4 shadow-[0_5px_16px_-12px_rgba(101,86,155,0.25)]"><div className="flex items-center justify-between gap-2"><div><h3 className="flex items-center gap-2 text-[13px] font-semibold text-[#535d77]"><Home className="h-4 w-4 text-[#b0a1d0]" /> ห้อง {room.number}</h3><p className="mt-1 text-[10px] text-[#a2a9b8]">โซน {zoneMap.get(room.zoneId) || "-"}</p></div><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] ${status.background} ${status.text}`}><span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />{status.label}</span></div><div className="mt-4 flex items-center justify-between text-[10px] text-[#a0a7b7]"><span>ผู้พักอาศัย</span><span className="text-[#8c83a7]">{room.residents.length} / {room.capacity} คน</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f2eff9]"><div className={`h-full rounded-full ${status.dot}`} style={{ width: `${room.capacity > 0 ? Math.min((room.residents.length / room.capacity) * 100, 100) : 0}%` }} /></div>{room.residents.length > 0 && <div className="mt-4 space-y-2 border-t border-[#f2eff8] pt-3">{room.residents.map((resident) => <div key={resident.id} className="flex items-center justify-between gap-3 text-[10px]"><span className="text-[#7c869c]">{resident.firstName} {resident.lastName}</span><span className="truncate text-[#b2b6c4]">{resident.jobRole}</span></div>)}</div>}</article>;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, unit, subtitle, tone, onClick }: {
  icon: ReactNode;
  label: string;
  value: number;
  unit: string;
  subtitle: string;
  tone: "violet" | "blue" | "lavender" | "coral";
  onClick: () => void;
}) {
  const tones = {
    violet: "bg-[#f0ebfc] text-[#a08ad0]",
    blue: "bg-[#edf4fc] text-[#8ba7d1]",
    lavender: "bg-[#f1effb] text-[#9a92cc]",
    coral: "bg-[#fff0ed] text-[#e5a69f]",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="dash-stat-card dash-card group w-full rounded-[22px] border border-white/90 bg-white/90 p-4 text-left transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_30px_-16px_rgba(116,99,167,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 sm:p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`flex h-9 w-9 items-center justify-center rounded-[13px] ${tones[tone]}`}>{icon}</span>
        <ArrowUpRight className="h-3.5 w-3.5 text-[#c8c3d7] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
      <div className="mt-4 flex flex-wrap items-baseline gap-2">
        <strong className="text-[27px] font-semibold leading-none tracking-tight text-[#303b57] sm:text-[31px]">{value.toLocaleString("th-TH")}</strong>
        <span className="text-[11px] text-[#929bb0]">{unit}</span>
      </div>
      <p className="mt-2.5 text-[11px] font-medium text-[#6f7a92]">{label}</p>
      <p className="mt-1 hidden text-[9px] text-[#8e98ac] sm:block">{subtitle}</p>
    </button>
  );
}

function MiniBreakdownCard({ label, subtitle, value, percent, background, textColor, dotBg, onClick }: {
  label: string;
  subtitle: string;
  value: number;
  percent: number;
  background: string;
  textColor: string;
  dotBg: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`dash-room-status group rounded-[18px] border border-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 ${background}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dotBg}`} />
        <span className="text-[9px] text-[#8791a7]">{percent}%</span>
      </div>
      <p className={`mt-3 text-[25px] font-semibold leading-none ${textColor}`}>
        {value}<span className="ml-1.5 text-[9px] font-normal text-[#8793a7]">ห้อง</span>
      </p>
      <p className="mt-3 text-[10px] font-medium text-[#68758e]">{label}</p>
      <p className="mt-1 text-[9px] text-[#8794a8]">{subtitle}</p>
    </button>
  );
}

function GroupBreakdownCard({ label, subLabel, value, percent, maleCount, femaleCount, height, gradient, onClick }: {
  label: string;
  subLabel: string;
  value: number;
  percent: number;
  maleCount: number;
  femaleCount: number;
  height: number;
  gradient: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="dash-group-bar group min-w-0 rounded-2xl px-1 pb-2 text-center transition hover:bg-[#f8f6fd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 sm:px-2"
    >
      <div className="flex h-[150px] flex-col items-center justify-end">
        <p className="mb-2 text-[12px] font-semibold text-[#82749d]">{value}</p>
        <div
          className={`w-[66%] max-w-[56px] rounded-t-[9px] bg-gradient-to-t shadow-[0_8px_15px_-10px_rgba(120,87,193,0.5)] transition-all duration-500 group-hover:brightness-105 ${gradient}`}
          style={{ height }}
        />
      </div>
      <p className="mt-3 text-[10px] font-semibold tracking-wide text-[#68718c]">{label}</p>
      <p className="mt-1 min-h-[25px] text-[8px] leading-[1.5] text-[#8d95a9] sm:text-[9px]">{subLabel}</p>
      <p className="mt-1 text-[9px] text-[#9380ad]">{percent}%</p>
      <div className="mt-2 flex justify-center gap-1.5 text-[8px] sm:text-[9px]">
        <span className="inline-flex items-center gap-0.5 text-[#8493ba]" aria-label={`ชาย ${maleCount} คน`}><Mars className="h-2.5 w-2.5" />{maleCount}</span>
        <span className="inline-flex items-center gap-0.5 text-[#b98ba7]" aria-label={`หญิง ${femaleCount} คน`}><Venus className="h-2.5 w-2.5" />{femaleCount}</span>
      </div>
    </button>
  );
}

function EmptyState({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <div className="dash-empty-state flex min-h-[185px] flex-col items-center justify-center px-3 py-7 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#f1edfb] to-[#edf5fc] text-[#b8a9d6]">{icon}</span>
      <p className="mt-4 text-[12px] font-medium text-[#7b849e]">{title}</p>
      <p className="mt-1.5 text-[10px] leading-relaxed text-[#929daf]">{detail}</p>
    </div>
  );
}
