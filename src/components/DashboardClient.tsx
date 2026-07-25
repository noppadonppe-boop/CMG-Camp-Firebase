import { useState, useMemo } from "react";
import { Users, BedDouble, Bell, TrendingUp, ArrowUpRight, ArrowDownLeft, X, Search, Building2, Home, Sparkles, UserCheck, Mars, Venus, Info } from "lucide-react";
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
      <div className="flex min-h-60 items-center justify-center">
        <p className="text-sm text-gray-400">กำลังโหลด...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <p className="text-sm text-gray-400">ไม่พบข้อมูลสำหรับแคมป์นี้</p>
      </div>
    );
  }

  const { stats, logs, chartData } = data;
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-baseline justify-between border-b border-gray-100 pb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Dashboard{" "}
            <span className="text-sm font-normal text-gray-400">{selectedCamp?.name}</span>
          </h1>
          <p className="text-[11px] text-gray-400">ภาพรวมแคมป์แบบเรียลไทม์</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-4.5 w-4.5 text-blue-500" />}
          label="คนงานทั้งหมด"
          value={stats.totalWorkers}
          bg="bg-blue-50"
          onClick={() => openDrawer("workers", "รายชื่อคนงานทั้งหมด", "totalWorkers")}
        />
        <StatCard
          icon={<TrendingUp className="h-4.5 w-4.5 text-emerald-500" />}
          label="อยู่ในแคมป์"
          value={stats.present}
          bg="bg-emerald-50"
          onClick={() => openDrawer("workers", "รายชื่อคนงานในแคมป์ทั้งหมด", "present")}
        />
        <StatCard
          icon={<BedDouble className="h-4.5 w-4.5 text-violet-500" />}
          label="ห้องที่ใช้งาน"
          value={`${stats.roomsOccupied}/${stats.roomsTotal}`}
          bg="bg-violet-50"
          onClick={() => openDrawer("rooms", "รายชื่อห้องพักที่มีผู้เข้าพักอาศัย", "roomsOccupied")}
        />
        <StatCard
          icon={<Bell className="h-4.5 w-4.5 text-orange-500" />}
          label="แจ้งเตือน"
          value={stats.alerts}
          bg="bg-orange-50"
          onClick={() => openDrawer("rooms", "รายชื่อห้องพักปิดซ่อมบำรุง", "alerts")}
        />
      </div>

      {/* Room Status Breakdown */}
      {stats.roomBreakdown && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">สถานะห้องพักทั้งหมด ({stats.roomsTotal} ห้อง)</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <MiniBreakdownCard
              label="ห้องว่าง"
              value={stats.roomBreakdown.empty}
              percent={stats.roomsTotal > 0 ? Math.round((stats.roomBreakdown.empty / stats.roomsTotal) * 100) : 0}
              bg="bg-emerald-50"
              border="border-emerald-100"
              textColor="text-emerald-700"
              dotBg="bg-emerald-500"
              onClick={() => openDrawer("rooms", "รายชื่อห้องพักว่าง (Empty)", "empty")}
            />
            <MiniBreakdownCard
              label="มีผู้อยู่บางส่วน"
              value={stats.roomBreakdown.partial}
              percent={stats.roomsTotal > 0 ? Math.round((stats.roomBreakdown.partial / stats.roomsTotal) * 100) : 0}
              bg="bg-yellow-50"
              border="border-yellow-100"
              textColor="text-yellow-700"
              dotBg="bg-yellow-400"
              onClick={() => openDrawer("rooms", "รายชื่อห้องมีผู้อยู่บางส่วน (Partial)", "partial")}
            />
            <MiniBreakdownCard
              label="ห้องเต็ม"
              value={stats.roomBreakdown.full}
              percent={stats.roomsTotal > 0 ? Math.round((stats.roomBreakdown.full / stats.roomsTotal) * 100) : 0}
              bg="bg-red-50"
              border="border-red-100"
              textColor="text-red-700"
              dotBg="bg-red-500"
              onClick={() => openDrawer("rooms", "รายชื่อห้องพักเต็มโควตา (Full)", "full")}
            />
            <MiniBreakdownCard
              label="ปิดซ่อมบำรุง"
              value={stats.roomBreakdown.maintenance}
              percent={stats.roomsTotal > 0 ? Math.round((stats.roomBreakdown.maintenance / stats.roomsTotal) * 100) : 0}
              bg="bg-gray-50"
              border="border-gray-200"
              textColor="text-gray-600"
              dotBg="bg-gray-400"
              onClick={() => openDrawer("rooms", "รายชื่อห้องปิดปรับปรุง/ซ่อมบำรุง (Maintenance)", "maintenance")}
            />
            <MiniBreakdownCard
              label="ห้องเก็บของ"
              value={stats.roomBreakdown.storage}
              percent={stats.roomsTotal > 0 ? Math.round((stats.roomBreakdown.storage / stats.roomsTotal) * 100) : 0}
              bg="bg-indigo-50"
              border="border-indigo-100"
              textColor="text-indigo-700"
              dotBg="bg-indigo-500"
              onClick={() => openDrawer("rooms", "รายชื่อห้องเก็บอุปกรณ์/สิ่งของ (Storage)", "storage")}
            />
          </div>

          {/* Progress Bar Visualizer */}
          <div className="mt-4 flex h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div style={{ width: `${stats.roomsTotal > 0 ? (stats.roomBreakdown.empty / stats.roomsTotal) * 100 : 0}%` }} className="bg-emerald-500 transition-all duration-500" title={`ห้องว่าง ${stats.roomBreakdown.empty} ห้อง`} />
            <div style={{ width: `${stats.roomsTotal > 0 ? (stats.roomBreakdown.partial / stats.roomsTotal) * 100 : 0}%` }} className="bg-yellow-400 transition-all duration-500" title={`มีผู้อยู่บางส่วน ${stats.roomBreakdown.partial} ห้อง`} />
            <div style={{ width: `${stats.roomsTotal > 0 ? (stats.roomBreakdown.full / stats.roomsTotal) * 100 : 0}%` }} className="bg-red-500 transition-all duration-500" title={`ห้องเต็ม ${stats.roomBreakdown.full} ห้อง`} />
            <div style={{ width: `${stats.roomsTotal > 0 ? (stats.roomBreakdown.maintenance / stats.roomsTotal) * 100 : 0}%` }} className="bg-gray-400 transition-all duration-500" title={`ปิดซ่อมบำรุง ${stats.roomBreakdown.maintenance} ห้อง`} />
            <div style={{ width: `${stats.roomsTotal > 0 ? (stats.roomBreakdown.storage / stats.roomsTotal) * 100 : 0}%` }} className="bg-indigo-500 transition-all duration-500" title={`ห้องเก็บของ ${stats.roomBreakdown.storage} ห้อง`} />
          </div>
        </div>
      )}

      {/* Resident Groups Breakdown */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">กลุ่มผู้พักอาศัยทั้งหมด ({campWorkers.length} คน)</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <GroupBreakdownCard
            label="DC TH"
            subLabel="CMG (คนไทย)"
            value={residentGroupStats["DC TH"].total}
            percent={campWorkers.length > 0 ? Math.round((residentGroupStats["DC TH"].total / campWorkers.length) * 100) : 0}
            maleCount={residentGroupStats["DC TH"].male}
            femaleCount={residentGroupStats["DC TH"].female}
            bg="bg-blue-50"
            border="border-blue-100"
            textColor="text-blue-700"
            dotBg="bg-blue-500"
            onClick={() => openDrawer("workers", "กลุ่มผู้พักอาศัย: CMG (คนไทย) [DC TH]", "DC_TH")}
          />
          <GroupBreakdownCard
            label="DC FR"
            subLabel="CMG (ต่างชาติ)"
            value={residentGroupStats["DC FR"].total}
            percent={campWorkers.length > 0 ? Math.round((residentGroupStats["DC FR"].total / campWorkers.length) * 100) : 0}
            maleCount={residentGroupStats["DC FR"].male}
            femaleCount={residentGroupStats["DC FR"].female}
            bg="bg-teal-50"
            border="border-teal-100"
            textColor="text-teal-700"
            dotBg="bg-teal-500"
            onClick={() => openDrawer("workers", "กลุ่มผู้พักอาศัย: CMG (ต่างชาติ) [DC FR]", "DC_FR")}
          />
          <GroupBreakdownCard
            label="FM"
            subLabel="ครอบครัว/ผู้อาศัยร่วม (CMG)"
            value={residentGroupStats["FM"].total}
            percent={campWorkers.length > 0 ? Math.round((residentGroupStats["FM"].total / campWorkers.length) * 100) : 0}
            maleCount={residentGroupStats["FM"].male}
            femaleCount={residentGroupStats["FM"].female}
            bg="bg-purple-50"
            border="border-purple-100"
            textColor="text-purple-700"
            dotBg="bg-purple-500"
            onClick={() => openDrawer("workers", "กลุ่มผู้พักอาศัย: ครอบครัว/ผู้อาศัยร่วม [FM]", "FM")}
          />
          <GroupBreakdownCard
            label="SUB"
            subLabel="ผู้รับเหมา"
            value={residentGroupStats["SUB"].total}
            percent={campWorkers.length > 0 ? Math.round((residentGroupStats["SUB"].total / campWorkers.length) * 100) : 0}
            maleCount={residentGroupStats["SUB"].male}
            femaleCount={residentGroupStats["SUB"].female}
            bg="bg-amber-50"
            border="border-amber-100"
            textColor="text-amber-700"
            dotBg="bg-amber-500"
            onClick={() => openDrawer("workers", "กลุ่มผู้พักอาศัย: ผู้รับเหมา [SUB]", "SUB")}
          />
        </div>

        {/* Progress Bar Visualizer */}
        <div className="mt-4 flex h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div style={{ width: `${campWorkers.length > 0 ? (residentGroupStats["DC TH"].total / campWorkers.length) * 100 : 0}%` }} className="bg-blue-500 transition-all duration-500" title={`CMG คนไทย ${residentGroupStats["DC TH"].total} คน`} />
          <div style={{ width: `${campWorkers.length > 0 ? (residentGroupStats["DC FR"].total / campWorkers.length) * 100 : 0}%` }} className="bg-teal-500 transition-all duration-500" title={`CMG ต่างชาติ ${residentGroupStats["DC FR"].total} คน`} />
          <div style={{ width: `${campWorkers.length > 0 ? (residentGroupStats["FM"].total / campWorkers.length) * 100 : 0}%` }} className="bg-purple-500 transition-all duration-500" title={`ครอบครัว CMG ${residentGroupStats["FM"].total} คน`} />
          <div style={{ width: `${campWorkers.length > 0 ? (residentGroupStats["SUB"].total / campWorkers.length) * 100 : 0}%` }} className="bg-amber-500 transition-all duration-500" title={`ผู้รับเหมา ${residentGroupStats["SUB"].total} คน`} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 animate-fade-in">
        {/* Recent access logs */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-xs font-bold text-gray-700 uppercase tracking-wider">การเข้า-ออกล่าสุด</h2>
          {logs.length === 0 ? (
            <div className="flex h-28 items-center justify-center">
              <p className="text-xs text-gray-400">ยังไม่มีข้อมูลการเข้า-ออก</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-3">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${log.avatarColor}`}
                  >
                    {log.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-gray-800">{log.name}</p>
                    <p className="text-[10px] text-gray-400">{log.role}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="text-gray-400">{log.time}</span>
                    {log.direction === "In" ? (
                      <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <ArrowDownLeft className="h-3 w-3 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-xs font-bold text-gray-700 uppercase tracking-wider">ปริมาณเข้า-ออกรายวัน</h2>
          {chartData.length === 0 ? (
            <div className="flex h-28 items-center justify-center">
              <p className="text-xs text-gray-400">ยังไม่มีข้อมูลกราฟ</p>
            </div>
          ) : (
            <div className="flex h-28 items-end gap-2">
              {chartData.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[9px] text-gray-400">{d.count}</span>
                  <div
                    className="w-full rounded-t-sm bg-blue-500 transition-all"
                    style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: "3px" }}
                  />
                  <span className="text-[9px] text-gray-500">{d.day}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Side Pane (Drawer) */}
      {drawerType && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
              onClick={() => setDrawerType(null)}
            />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md border-l border-gray-200 bg-white shadow-2xl flex flex-col h-full transform transition duration-500 ease-in-out">
                {/* Header */}
                <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2" id="slide-over-title">
                      {drawerType === "workers" ? <Users className="h-4.5 w-4.5 text-blue-500" /> : <Home className="h-4.5 w-4.5 text-violet-500" />}
                      {drawerTitle}
                    </h2>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        className="relative rounded-lg p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 outline-none transition cursor-pointer"
                        onClick={() => setDrawerType(null)}
                      >
                        <X className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">พบทั้งหมด {drawerItems.length} รายการ</p>

                  {/* Search Input */}
                  <div className="relative mt-3">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-xs outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 hover:border-gray-300 transition shadow-xs"
                      placeholder={drawerType === "workers" ? "ค้นหาชื่อ, ตำแหน่ง, ผู้รับเหมา, ห้อง..." : "ค้นหาเลขห้อง, โซน, หรือรายชื่อ..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
                  {drawerItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-xs text-gray-400 font-medium">ไม่พบข้อมูลที่ตรงกับเงื่อนไข</p>
                      <p className="text-[10px] text-gray-300 mt-1">ลองใช้คำค้นหาแบบอื่นหรือตรวจสอบตัวกรอง</p>
                    </div>
                  ) : drawerType === "workers" ? (
                    // Workers List
                    (drawerItems as typeof campWorkers).map((worker) => (
                      <div key={worker.id} className="rounded-xl border border-gray-100 bg-white p-3 shadow-xs hover:shadow-md transition duration-200 flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 border border-blue-100">
                          {worker.firstName.charAt(0)}{worker.lastName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-gray-800 truncate">
                            {worker.firstName} {worker.lastName}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">{worker.jobRole} • {worker.subcontractor}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                              ห้อง {roomMap.get(worker.roomId) || "ยังไม่ได้จัดห้อง"}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-50 text-gray-600 rounded-md border border-gray-200">
                              โซน {zoneMap.get(worker.zoneId) || "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Rooms List
                    (drawerItems as typeof enrichedRooms).map((room) => {
                      const computedStyles: Record<string, { badge: string; text: string; dot: string }> = {
                        empty: { badge: "bg-emerald-50 text-emerald-700 border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
                        partial: { badge: "bg-yellow-50 text-yellow-700 border-yellow-100", text: "text-yellow-700", dot: "bg-yellow-400" },
                        full: { badge: "bg-red-50 text-red-700 border-red-100", text: "text-red-700", dot: "bg-red-500" },
                        maintenance: { badge: "bg-gray-50 text-gray-600 border-gray-200", text: "text-gray-500", dot: "bg-gray-400" },
                        storage: { badge: "bg-indigo-50 text-indigo-700 border-indigo-100", text: "text-indigo-700", dot: "bg-indigo-500" },
                      };
                      const s = computedStyles[room.computedStatus] || computedStyles.empty;

                      return (
                        <div key={room.id} className="rounded-xl border border-gray-100 bg-white p-3 shadow-xs hover:shadow-md transition duration-200">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                                ห้อง {room.number}
                                <span className="text-[10px] font-normal text-gray-400">({zoneMap.get(room.zoneId)})</span>
                              </h4>
                            </div>
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold ${s.badge}`}>
                              <span className={`h-1 w-1 rounded-full ${s.dot}`} />
                              {room.computedStatus === "empty" && "ว่าง"}
                              {room.computedStatus === "partial" && "มีผู้อยู่"}
                              {room.computedStatus === "full" && "เต็มโควตา"}
                              {room.computedStatus === "maintenance" && "ซ่อมบำรุง"}
                              {room.computedStatus === "storage" && "เก็บของ"}
                            </span>
                          </div>

                          <div className="mt-2 text-[10px] font-medium text-gray-500 flex items-center justify-between">
                            <span>ผู้พักอาศัย ({room.residents.length} / {room.capacity} คน)</span>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-1 flex h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                              style={{ width: `${room.capacity > 0 ? (room.residents.length / room.capacity) * 100 : 0}%` }}
                              className={`rounded-full transition-all duration-300 ${room.computedStatus === "full" ? "bg-red-500" : "bg-blue-500"}`}
                            />
                          </div>

                          {/* Residents Names list inside the room item */}
                          {room.residents.length > 0 && (
                            <div className="mt-2 border-t border-gray-100 pt-1.5 space-y-1">
                              {room.residents.map((r) => (
                                <p key={r.id} className="text-[10px] text-gray-600 flex items-center justify-between font-medium">
                                  <span>{r.firstName} {r.lastName}</span>
                                  <span className="text-[9px] text-gray-400">{r.jobRole}</span>
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bg,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  bg: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`rounded-xl border border-gray-200 bg-white p-3 shadow-sm flex items-center gap-3 w-full text-left transition-all duration-200 ${
        onClick ? "hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer" : ""
      }`}
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}>
        {icon}
      </div>
      <div>
        <p className="text-lg font-extrabold text-gray-800 leading-none">{value}</p>
        <p className="mt-1 text-[11px] font-medium text-gray-400">{label}</p>
      </div>
    </button>
  );
}

function MiniBreakdownCard({
  label,
  value,
  percent,
  bg,
  border,
  textColor,
  dotBg,
  onClick,
}: {
  label: string;
  value: number;
  percent: number;
  bg: string;
  border: string;
  textColor: string;
  dotBg: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`rounded-xl border p-2 ${bg} ${border} flex items-center justify-between w-full text-left transition-all duration-200 ${
        onClick ? "hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotBg}`} />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-gray-500 truncate leading-tight">{label}</p>
          <p className={`text-base font-extrabold leading-none ${textColor} mt-0.5`}>{value}</p>
        </div>
      </div>
      <span className="text-[9px] font-medium text-gray-400 bg-white/60 px-1 py-0.5 rounded shrink-0">{percent}%</span>
    </button>
  );
}

function GroupBreakdownCard({
  label,
  subLabel,
  value,
  percent,
  maleCount,
  femaleCount,
  bg,
  border,
  textColor,
  dotBg,
  onClick,
}: {
  label: string;
  subLabel: string;
  value: number;
  percent: number;
  maleCount: number;
  femaleCount: number;
  bg: string;
  border: string;
  textColor: string;
  dotBg: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`rounded-xl border p-3 ${bg} ${border} flex flex-col justify-between w-full text-left transition-all duration-200 ${
        onClick ? "hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between w-full">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotBg}`} />
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold text-gray-800 uppercase tracking-wider">{label}</p>
            <p className="text-[9px] text-gray-400 truncate leading-none mt-0.5">{subLabel}</p>
          </div>
        </div>
        <span className="text-[9px] font-bold text-gray-400 bg-white/70 px-1.5 py-0.5 rounded shrink-0">{percent}%</span>
      </div>

      <div className="mt-3 flex items-baseline justify-between w-full">
        <p className={`text-xl font-black leading-none ${textColor}`}>{value}</p>
        
        {/* Gender breakdown */}
        <div className="flex items-center gap-1 text-[9px] font-semibold text-gray-500">
          <span className="flex items-center gap-0.5 text-blue-600 bg-blue-50/50 px-1 py-0.5 rounded">
            <Mars className="h-2.5 w-2.5" /> {maleCount}
          </span>
          <span className="flex items-center gap-0.5 text-pink-600 bg-pink-50/50 px-1 py-0.5 rounded">
            <Venus className="h-2.5 w-2.5" /> {femaleCount}
          </span>
        </div>
      </div>
    </button>
  );
}
