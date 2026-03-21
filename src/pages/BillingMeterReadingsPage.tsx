import { useState, useMemo } from "react";
import {
  Zap,
  Droplets,
  Save,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Search,
  Building2,
  Gauge,
  Calculator,
  Loader2,
} from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { useRooms, useZones } from "@/lib/db/useRooms";
import { saveMeterReading } from "@/lib/db/useBilling";

/* ─── Types ──────────────────────────────────────────────────── */

interface RoomReading {
  id: string;
  roomNumber: string;
  zone: string;
  building: string;
  occupants: number;
  waterPrev: number;
  waterCurr: string;
  elecPrev: number;
  elecCurr: string;
  saved: boolean;
}

/* ─── Rates ───────────────────────────────────────────────────── */

const WATER_RATE = 18.0;
const ELEC_RATE  = 4.5;

const BILLING_MONTH = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

/* ─── Helpers ────────────────────────────────────────────────── */

function formatMonth(d: Date) {
  return d.toLocaleDateString("th-TH", { month: "long", year: "numeric" });
}

function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcUsage(prev: number, curr: string): number | null {
  const c = parseFloat(curr);
  if (isNaN(c)) return null;
  return Math.max(c - prev, 0);
}

/* ─── Sub-components ─────────────────────────────────────────── */

function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${color}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="mt-0.5 text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}

function MeterInput({
  label,
  icon: Icon,
  color,
  prevUnit,
  currValue,
  onChange,
  rate,
  error,
}: {
  label: string;
  icon: React.ElementType;
  color: string;
  prevUnit: number;
  currValue: string;
  onChange: (v: string) => void;
  rate: number;
  error?: string;
}) {
  const usage = calcUsage(prevUnit, currValue);
  const cost  = usage !== null ? usage * rate : null;

  return (
    <div className={`rounded-xl border-2 p-4 transition ${error ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"}`}>
      <div className="mb-3 flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-400">
            ค่าเดือนที่แล้ว
          </label>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold tabular-nums text-gray-500">
            {prevUnit.toLocaleString()}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-400">
            ค่าเดือนนี้ <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={prevUnit}
            step="0.01"
            value={currValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={String(prevUnit)}
            className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold tabular-nums outline-none transition focus:ring-2 focus:ring-blue-500 ${
              error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white hover:border-gray-400"
            }`}
          />
        </div>
      </div>

      {usage !== null && (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs">
          <span className="text-gray-500">
            ใช้ไป: <strong className="text-gray-700">{fmt(usage)} หน่วย</strong>
          </span>
          <span className="font-semibold text-blue-700">
            ฿{fmt(cost!)}
          </span>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ─── Room Row Card ──────────────────────────────────────────── */

function RoomCard({
  room,
  onWaterChange,
  onElecChange,
  onSave,
}: {
  room: RoomReading;
  onWaterChange: (v: string) => void;
  onElecChange: (v: string) => void;
  onSave: () => void;
}) {
  const waterUsage = calcUsage(room.waterPrev, room.waterCurr);
  const elecUsage  = calcUsage(room.elecPrev,  room.elecCurr);
  const waterCost  = waterUsage !== null ? waterUsage * WATER_RATE : null;
  const elecCost   = elecUsage  !== null ? elecUsage  * ELEC_RATE  : null;
  const totalCost  = waterCost !== null && elecCost !== null ? waterCost + elecCost : null;

  const waterErr = room.waterCurr !== "" && parseFloat(room.waterCurr) < room.waterPrev
    ? "ค่าปัจจุบันต้องไม่น้อยกว่าค่าเดือนที่แล้ว"
    : undefined;
  const elecErr = room.elecCurr !== "" && parseFloat(room.elecCurr) < room.elecPrev
    ? "ค่าปัจจุบันต้องไม่น้อยกว่าค่าเดือนที่แล้ว"
    : undefined;

  const canSave = room.waterCurr !== "" && room.elecCurr !== "" && !waterErr && !elecErr && !room.saved;

  return (
    <div className={`rounded-2xl border-2 bg-white shadow-sm transition-all ${
      room.saved ? "border-emerald-300 bg-emerald-50/30" : "border-gray-200"
    }`}>
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
            {room.roomNumber.split("-")[0]}
          </div>
          <div>
            <p className="text-base font-bold text-gray-800">{room.roomNumber}</p>
            <p className="text-xs text-gray-400">{room.zone} · {room.building}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
            {room.occupants} คน
          </span>
          {room.saved && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              บันทึกแล้ว
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        <MeterInput
          label="มิเตอร์น้ำ (Water)"
          icon={Droplets}
          color="bg-blue-500"
          prevUnit={room.waterPrev}
          currValue={room.waterCurr}
          onChange={onWaterChange}
          rate={WATER_RATE}
          error={waterErr}
        />
        <MeterInput
          label="มิเตอร์ไฟฟ้า (Electricity)"
          icon={Zap}
          color="bg-amber-500"
          prevUnit={room.elecPrev}
          currValue={room.elecCurr}
          onChange={onElecChange}
          rate={ELEC_RATE}
          error={elecErr}
        />
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
        <div className="text-sm">
          {totalCost !== null ? (
            <span className="text-gray-600">
              รวมค่าสาธารณูปโภค:{" "}
              <strong className="text-gray-900">฿{fmt(totalCost)}</strong>
            </span>
          ) : (
            <span className="text-gray-400 text-xs">กรอกค่ามิเตอร์เพื่อดูยอดรวม</span>
          )}
        </div>
        <button
          onClick={onSave}
          disabled={!canSave}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-95 ${
            room.saved
              ? "cursor-default bg-emerald-100 text-emerald-700"
              : canSave
              ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              : "cursor-not-allowed bg-gray-100 text-gray-400"
          }`}
        >
          {room.saved ? (
            <><CheckCircle2 className="h-4 w-4" /> บันทึกแล้ว</>
          ) : (
            <><Save className="h-4 w-4" /> บันทึก</>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function BillingMeterReadingsPage() {
  const { rooms: firestoreRooms, loading: roomsLoading } = useRooms();
  const { zones: firestoreZones }                        = useZones();

  const [readings, setReadings] = useState<Record<string, { waterCurr: string; elecCurr: string; saved: boolean }>>({});
  const [zoneFilter, setZoneFilter]       = useState<string>("all");
  const [search, setSearch]               = useState("");
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const rooms: RoomReading[] = useMemo(() =>
    firestoreRooms
      .filter((r) => r.status !== "maintenance")
      .map((r) => {
        const zoneLabel = firestoreZones.find((z) => z.id === r.zoneId)?.label ?? r.zoneId;
        const state = readings[r.id] ?? { waterCurr: "", elecCurr: "", saved: false };
        return {
          id: r.id,
          roomNumber: r.number,
          zone: zoneLabel,
          building: zoneLabel,
          occupants: r.occupied,
          waterPrev: 0,
          elecPrev: 0,
          waterCurr: state.waterCurr,
          elecCurr: state.elecCurr,
          saved: state.saved,
        };
      }),
    [firestoreRooms, firestoreZones, readings]
  );

  const totalRooms   = rooms.length;
  const savedCount   = rooms.filter((r) => r.saved).length;
  const pendingCount = totalRooms - savedCount;

  const zones = useMemo(() => {
    const labels = firestoreZones.map((z) => z.label);
    return ["all", ...labels];
  }, [firestoreZones]);

  const filtered = useMemo(() => {
    return rooms.filter((r) => {
      if (zoneFilter !== "all" && r.zone !== zoneFilter) return false;
      if (showSavedOnly && !r.saved) return false;
      if (search && !r.roomNumber.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [rooms, zoneFilter, showSavedOnly, search]);

  function update(id: string, patch: { waterCurr?: string; elecCurr?: string; saved?: boolean }) {
    setReadings((prev) => ({ ...prev, [id]: { ...(prev[id] ?? { waterCurr: "", elecCurr: "", saved: false }), ...patch } }));
  }

  async function saveRoom(id: string) {
    const room = rooms.find((r) => r.id === id);
    if (!room) return;
    await saveMeterReading({
      roomId: id,
      roomNumber: room.roomNumber,
      zone: room.zone,
      building: room.building,
      occupants: room.occupants,
      billingMonth: Timestamp.fromDate(BILLING_MONTH),
      waterPrev: room.waterPrev,
      waterCurr: parseFloat(room.waterCurr) || 0,
      elecPrev: room.elecPrev,
      elecCurr: parseFloat(room.elecCurr) || 0,
    });
    update(id, { saved: true });
  }

  async function saveAll() {
    const canSave = filtered.filter((r) => {
      const wOk = r.waterCurr !== "" && parseFloat(r.waterCurr) >= r.waterPrev;
      const eOk = r.elecCurr  !== "" && parseFloat(r.elecCurr)  >= r.elecPrev;
      return wOk && eOk && !r.saved;
    });
    if (canSave.length === 0) {
      alert("กรุณากรอกค่ามิเตอร์ทุกห้องให้ครบก่อนบันทึกทั้งหมด");
      return;
    }
    await Promise.all(canSave.map((r) => saveRoom(r.id)));
  }

  if (roomsLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        <p className="text-sm text-gray-400">กำลังโหลดข้อมูลห้อง...</p>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          บันทึกค่ามิเตอร์{" "}
          <span className="text-lg font-normal text-gray-400">Meter Readings</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          ประจำเดือน{" "}
          <span className="font-semibold text-blue-600">{formatMonth(BILLING_MONTH)}</span>
          {" — "}อัตราน้ำ ฿{WATER_RATE}/หน่วย · อัตราไฟฟ้า ฿{ELEC_RATE}/หน่วย
        </p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatPill label="ห้องทั้งหมด" value={totalRooms} color="border-gray-200 bg-white text-gray-800" />
        <StatPill label="บันทึกแล้ว" value={savedCount} color="border-emerald-200 bg-emerald-50 text-emerald-800" />
        <StatPill
          label="รอบันทึก"
          value={pendingCount}
          color={pendingCount > 0 ? "border-amber-200 bg-amber-50 text-amber-800" : "border-gray-200 bg-white text-gray-800"}
        />
        <StatPill
          label="ความคืบหน้า"
          value={`${Math.round((savedCount / totalRooms) * 100)}%`}
          color="border-blue-200 bg-blue-50 text-blue-800"
        />
      </div>

      <div className="mb-6 h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${(savedCount / totalRooms) * 100}%` }}
        />
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาห้อง..."
            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition hover:border-gray-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-9 text-sm outline-none hover:border-gray-400 focus:ring-2 focus:ring-blue-500"
          >
            {zones.map((z) => (
              <option key={z} value={z}>
                {z === "all" ? "ทุกโซน" : z}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        <button
          onClick={() => setShowSavedOnly((v) => !v)}
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
            showSavedOnly
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
          }`}
        >
          {showSavedOnly ? "แสดงทั้งหมด" : "แสดงเฉพาะที่บันทึกแล้ว"}
        </button>
      </div>

      {pendingCount > 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
          <p className="text-sm text-amber-700">
            ยังมี <strong>{pendingCount} ห้อง</strong> ที่ยังไม่ได้บันทึกค่ามิเตอร์เดือนนี้
          </p>
        </div>
      )}

      {savedCount === totalRooms && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
          <p className="text-sm text-emerald-700 font-medium">
            บันทึกค่ามิเตอร์ครบทุกห้องแล้ว พร้อมสร้างใบแจ้งหนี้ประจำเดือน
          </p>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white text-center">
          <Gauge className="h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-400">ไม่พบห้องที่ตรงกับตัวกรอง</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onWaterChange={(v) => update(room.id, { waterCurr: v, saved: false })}
              onElecChange={(v)  => update(room.id, { elecCurr: v,  saved: false })}
              onSave={() => saveRoom(room.id)}
            />
          ))}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:left-60">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calculator className="h-4 w-4 text-gray-400" />
            <span>
              บันทึกแล้ว{" "}
              <strong className="text-gray-800">{savedCount}/{totalRooms}</strong> ห้อง
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={saveAll}
              disabled={filtered.every((r) => r.saved)}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition active:scale-95 ${
                filtered.every((r) => r.saved)
                  ? "cursor-not-allowed bg-gray-100 text-gray-400"
                  : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              }`}
            >
              <Save className="h-4 w-4" />
              บันทึกทั้งหมดที่แสดง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
