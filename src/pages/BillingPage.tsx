import { useState, useEffect } from "react";
import { Droplets, Zap, Wrench, ChevronDown, Loader2, TrendingUp, Building2 } from "lucide-react";
import { useRooms, useZones, type Room } from "@/lib/db/useRooms";
import { useWorkers } from "@/lib/db/useWorkers";
import { useCamps } from "@/lib/db/useCamps";
import { useElectricityHistory, useMaintenanceFeeHistory } from "@/lib/db/useRoomHistory";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ElectricityRecord, MaintenanceFeeRecord } from "@/lib/db/useRoomHistory";

const ROOT = "cmg-camp-manager";
const ROOT_DOC = "root";
const WATER_RATE = 150; // ฿/คน/เดือน

// ── helpers ────────────────────────────────────────────────────────────────────
function fmtBaht(n: number) { return n.toLocaleString("th-TH"); }
function fmtMonthLabel(m: string) {
  const [y, mo] = m.split("-");
  return new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString("th-TH", { month: "long", year: "numeric" });
}

// ── hook: fetch all rooms' subcollection for a given month ────────────────────
function useAllRoomBilling(rooms: Room[], month: string) {
  const [elecMap, setElecMap] = useState<Record<string, ElectricityRecord | null>>({});
  const [maintMap, setMaintMap] = useState<Record<string, MaintenanceFeeRecord | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (rooms.length === 0) { setLoading(false); return; }
    let remaining = rooms.length * 2;
    const done = () => { remaining--; if (remaining === 0) setLoading(false); };

    const unsubs = rooms.flatMap((room) => {
      const elecQ = query(collection(db, ROOT, ROOT_DOC, "rooms", room.id, "electricityHistory"), orderBy("date", "desc"));
      const maintQ = query(collection(db, ROOT, ROOT_DOC, "rooms", room.id, "maintenanceFeeHistory"), orderBy("date", "desc"));

      const u1 = onSnapshot(elecQ, (snap) => {
        const rec = snap.docs.map(d => ({ id: d.id, ...d.data() } as ElectricityRecord)).find(r => r.month === month) ?? null;
        setElecMap(prev => ({ ...prev, [room.id]: rec }));
        done();
      }, done);

      const u2 = onSnapshot(maintQ, (snap) => {
        const rec = snap.docs.map(d => ({ id: d.id, ...d.data() } as MaintenanceFeeRecord)).find(r => r.month === month) ?? null;
        setMaintMap(prev => ({ ...prev, [room.id]: rec }));
        done();
      }, done);

      return [u1, u2];
    });

    return () => unsubs.forEach(u => u());
  }, [rooms, month]);

  return { elecMap, maintMap, loading };
}

// ── Sub-component: one room billing row ───────────────────────────────────────
function RoomBillingRow({ room, occupants, elec, maint }: {
  room: Room;
  occupants: number;
  elec: ElectricityRecord | null;
  maint: MaintenanceFeeRecord | null;
}) {
  const water = occupants * WATER_RATE;
  const electricity = elec ? elec.totalCost : 0;
  const maintenance = maint?.charged ? (maint.totalCost) : 0;
  const total = water + electricity + maintenance;

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/60 transition">
      <td className="py-3 pl-4 pr-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">{room.number.slice(0, 2)}</div>
          <span className="text-sm font-bold text-gray-800">{room.number}</span>
        </div>
      </td>
      <td className="py-3 px-2 text-center">
        <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">{occupants}</span>
      </td>
      <td className="py-3 px-2 text-right text-xs font-semibold text-blue-600 tabular-nums">{occupants > 0 ? fmtBaht(water) : "–"}</td>
      <td className="py-3 px-2 text-right text-xs font-semibold tabular-nums">
        {elec ? <span className="text-amber-600">{fmtBaht(electricity)}</span> : <span className="text-gray-300">ไม่มีข้อมูล</span>}
      </td>
      <td className="py-3 px-2 text-right text-xs font-semibold tabular-nums">
        {maint
          ? (maint.charged ? <span className="text-violet-600">{fmtBaht(maintenance)}</span> : <span className="text-gray-400">ไม่เก็บ</span>)
          : <span className="text-gray-300">ไม่มีข้อมูล</span>}
      </td>
      <td className="py-3 pl-2 pr-4 text-right">
        <span className="text-sm font-bold text-gray-800 tabular-nums">{fmtBaht(total)} ฿</span>
      </td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BillingPage() {
  const { rooms, loading: roomsLoading } = useRooms();
  const { zones, loading: zonesLoading } = useZones();
  const { camps, loading: campsLoading } = useCamps();
  const { workers } = useWorkers();

  // Month picker — default to current month
  const thisMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(thisMonth);
  const [selectedCampId, setSelectedCampId] = useState("all");

  // Build month options (current month + 11 prior)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    return d.toISOString().slice(0, 7);
  });

  const availableZones = selectedCampId === "all" ? zones : zones.filter(z => z.campId === selectedCampId);
  const filteredRooms = rooms.filter(r => availableZones.some(z => z.id === r.zoneId) && r.status !== "maintenance");

  const { elecMap, maintMap, loading: billingLoading } = useAllRoomBilling(filteredRooms, selectedMonth);

  const loading = roomsLoading || zonesLoading || campsLoading || billingLoading;

  // Compute summary
  const summary = filteredRooms.map(room => {
    const occupants = workers.filter(w => w.roomId === room.id).length;
    const elec = elecMap[room.id] ?? null;
    const maint = maintMap[room.id] ?? null;
    const water = occupants * WATER_RATE;
    const electricity = elec ? elec.totalCost : 0;
    const maintenance = maint?.charged ? maint.totalCost : 0;
    return { room, occupants, elec, maint, water, electricity, maintenance, total: water + electricity + maintenance };
  });

  const totalWater = summary.reduce((s, r) => s + r.water, 0);
  const totalElec = summary.reduce((s, r) => s + r.electricity, 0);
  const totalMaint = summary.reduce((s, r) => s + r.maintenance, 0);
  const grandTotal = totalWater + totalElec + totalMaint;
  const occupiedRooms = summary.filter(r => r.occupants > 0).length;
  const missingElec = summary.filter(r => r.occupants > 0 && !r.elec).length;

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            ระบบบิลค่าใช้จ่าย <span className="text-lg font-normal text-gray-400">Camp Billing</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">สรุปค่าน้ำ ค่าไฟ และค่าบำรุงรักษา รายเดือน</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {/* Camp filter */}
          <div className="relative">
            <select value={selectedCampId} onChange={e => setSelectedCampId(e.target.value)} className="appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 pr-8 text-sm font-semibold text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              <option value="all">ทุกแคมป์</option>
              {camps.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          {/* Month picker */}
          <div className="relative">
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="appearance-none rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 pr-8 text-sm font-bold text-blue-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              {monthOptions.map(m => <option key={m} value={m}>{fmtMonthLabel(m)}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          <p className="text-sm text-gray-400">กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        <>
          {/* ── KPI Cards ── */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-400">ยอดรวมทั้งหมด</span>
              </div>
              <p className="text-xl font-bold text-gray-800 tabular-nums">{fmtBaht(grandTotal)} <span className="text-sm font-normal text-gray-400">฿</span></p>
              <p className="mt-0.5 text-xs text-gray-400">{occupiedRooms} ห้องที่มีผู้พัก</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-medium text-blue-500">ค่าน้ำ</span>
              </div>
              <p className="text-xl font-bold text-blue-700 tabular-nums">{fmtBaht(totalWater)} <span className="text-sm font-normal text-blue-400">฿</span></p>
              <p className="mt-0.5 text-xs text-blue-400">คนละ {WATER_RATE} บาท</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-medium text-amber-500">ค่าไฟ</span>
              </div>
              <p className="text-xl font-bold text-amber-700 tabular-nums">{fmtBaht(totalElec)} <span className="text-sm font-normal text-amber-400">฿</span></p>
              <p className="mt-0.5 text-xs text-amber-400">
                {missingElec > 0 ? <span className="text-orange-500">⚠ ขาดข้อมูล {missingElec} ห้อง</span> : "ครบทุกห้อง"}
              </p>
            </div>
            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="h-4 w-4 text-violet-400" />
                <span className="text-xs font-medium text-violet-500">ค่าบำรุงรักษา</span>
              </div>
              <p className="text-xl font-bold text-violet-700 tabular-nums">{fmtBaht(totalMaint)} <span className="text-sm font-normal text-violet-400">฿</span></p>
              <p className="mt-0.5 text-xs text-violet-400">คนละ 150 บาท</p>
            </div>
          </div>

          {/* ── Summary breakdown bar ── */}
          {grandTotal > 0 && (
            <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">สัดส่วนค่าใช้จ่าย</p>
              <div className="flex h-3 w-full overflow-hidden rounded-full">
                <div className="bg-blue-400 transition-all" style={{ width: `${(totalWater / grandTotal) * 100}%` }} title={`ค่าน้ำ ${fmtBaht(totalWater)} ฿`} />
                <div className="bg-amber-400 transition-all" style={{ width: `${(totalElec / grandTotal) * 100}%` }} title={`ค่าไฟ ${fmtBaht(totalElec)} ฿`} />
                <div className="bg-violet-400 transition-all" style={{ width: `${(totalMaint / grandTotal) * 100}%` }} title={`ค่าบำรุง ${fmtBaht(totalMaint)} ฿`} />
              </div>
              <div className="mt-2.5 flex flex-wrap gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-400" />ค่าน้ำ {Math.round((totalWater / grandTotal) * 100)}%</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />ค่าไฟ {Math.round((totalElec / grandTotal) * 100)}%</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-violet-400" />ค่าบำรุง {Math.round((totalMaint / grandTotal) * 100)}%</span>
              </div>
            </div>
          )}

          {/* ── Room Table ── */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-bold text-gray-700">รายละเอียดรายห้อง</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">{filteredRooms.length}</span>
              </div>
              <span className="text-xs text-gray-400 font-medium">{fmtMonthLabel(selectedMonth)}</span>
            </div>

            {filteredRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                <Building2 className="h-8 w-8 mb-2" />
                <p className="text-sm">ไม่พบห้องพัก</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80">
                      <th className="py-2.5 pl-4 pr-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">ห้อง</th>
                      <th className="py-2.5 px-2 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">ผู้พัก</th>
                      <th className="py-2.5 px-2 text-right text-[10px] font-bold uppercase tracking-wider text-blue-400">
                        <span className="flex items-center justify-end gap-1"><Droplets className="h-3 w-3" />น้ำ</span>
                      </th>
                      <th className="py-2.5 px-2 text-right text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        <span className="flex items-center justify-end gap-1"><Zap className="h-3 w-3" />ไฟ</span>
                      </th>
                      <th className="py-2.5 px-2 text-right text-[10px] font-bold uppercase tracking-wider text-violet-400">
                        <span className="flex items-center justify-end gap-1"><Wrench className="h-3 w-3" />บำรุง</span>
                      </th>
                      <th className="py-2.5 pl-2 pr-4 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">รวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.map(({ room, occupants, elec, maint }) => (
                      <RoomBillingRow key={room.id} room={room} occupants={occupants} elec={elec} maint={maint} />
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 bg-gray-50">
                      <td colSpan={2} className="py-3 pl-4 pr-2 text-xs font-bold text-gray-600">รวมทั้งหมด</td>
                      <td className="py-3 px-2 text-right text-xs font-bold text-blue-700 tabular-nums">{fmtBaht(totalWater)}</td>
                      <td className="py-3 px-2 text-right text-xs font-bold text-amber-700 tabular-nums">{fmtBaht(totalElec)}</td>
                      <td className="py-3 px-2 text-right text-xs font-bold text-violet-700 tabular-nums">{fmtBaht(totalMaint)}</td>
                      <td className="py-3 pl-2 pr-4 text-right text-sm font-extrabold text-gray-800 tabular-nums">{fmtBaht(grandTotal)} ฿</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
