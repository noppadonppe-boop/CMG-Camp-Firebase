import { useState } from "react";
import { BedDouble, Users, Wrench, ChevronDown, Plus, X, Building2, Loader2 } from "lucide-react";
import {
  useRooms,
  useZones,
  addRoom,
  addZone,
  type Room,
  type Zone,
  type RoomStatus,
} from "@/lib/db/useRooms";

const STATUS_CONFIG: Record<RoomStatus, { label: string; cardBg: string; cardBorder: string; cardHover: string; badgeBg: string; badgeText: string; textColor: string; dotColor: string; icon: React.ElementType }> = {
  empty:       { label: "ว่าง",      cardBg: "bg-emerald-50", cardBorder: "border-emerald-200", cardHover: "hover:bg-emerald-100 hover:border-emerald-400 hover:shadow-emerald-100", badgeBg: "bg-emerald-100", badgeText: "text-emerald-700", textColor: "text-emerald-700", dotColor: "bg-emerald-500", icon: BedDouble },
  partial:     { label: "มีผู้อยู่", cardBg: "bg-yellow-50",  cardBorder: "border-yellow-200",  cardHover: "hover:bg-yellow-100 hover:border-yellow-400 hover:shadow-yellow-100",   badgeBg: "bg-yellow-100",  badgeText: "text-yellow-700",  textColor: "text-yellow-700",  dotColor: "bg-yellow-400",  icon: Users },
  full:        { label: "เต็ม",      cardBg: "bg-red-50",     cardBorder: "border-red-200",     cardHover: "hover:bg-red-100 hover:border-red-400 hover:shadow-red-100",           badgeBg: "bg-red-100",     badgeText: "text-red-700",     textColor: "text-red-700",     dotColor: "bg-red-500",     icon: Users },
  maintenance: { label: "ซ่อมบำรุ",  cardBg: "bg-gray-100",   cardBorder: "border-gray-300",    cardHover: "hover:bg-gray-200 hover:border-gray-400 hover:shadow-gray-200",         badgeBg: "bg-gray-200",    badgeText: "text-gray-600",    textColor: "text-gray-500",    dotColor: "bg-gray-400",    icon: Wrench },
};

type StatusFilter = "all" | RoomStatus;
const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all",         label: "ทั้งหมด" },
  { value: "empty",       label: "ว่าง" },
  { value: "partial",     label: "มีผู้อยู่บางส่วน" },
  { value: "full",        label: "เต็ม" },
  { value: "maintenance", label: "ซ่อมบำรุ" },
];

function BedPips({ occupied, capacity, status }: { occupied: number; capacity: number; status: RoomStatus }) {
  if (status === "maintenance") return null;
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {Array.from({ length: capacity }).map((_, i) => (
        <span key={i} className={`h-2 w-2 rounded-sm ${i < occupied ? STATUS_CONFIG[status].dotColor : "bg-gray-300"}`} />
      ))}
    </div>
  );
}

function RoomCard({ room, onClick }: { room: Room; onClick: () => void }) {
  const cfg = STATUS_CONFIG[room.status];
  const Icon = cfg.icon;
  return (
    <button onClick={onClick} className={`group relative flex flex-col items-start rounded-xl border p-3.5 text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 shadow-sm hover:shadow-md cursor-pointer ${cfg.cardBg} ${cfg.cardBorder} ${cfg.cardHover}`}>
      <div className="flex w-full items-center justify-between">
        <span className={`text-sm font-bold ${cfg.textColor}`}>{room.number}</span>
        <Icon className={`h-4 w-4 ${cfg.textColor} opacity-70`} />
      </div>
      <div className="mt-1.5">
        {room.status === "maintenance" ? (
          <span className="text-xs text-gray-500">ซ่อมบำรุ</span>
        ) : (
          <span className={`text-lg font-bold tabular-nums ${cfg.textColor}`}>{room.occupied}<span className="text-sm font-normal opacity-60">/{room.capacity}</span></span>
        )}
      </div>
      <BedPips occupied={room.occupied} capacity={room.capacity} status={room.status} />
      <span className={`mt-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.badgeBg} ${cfg.badgeText}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />
        {cfg.label}
      </span>
    </button>
  );
}

function AddZoneModal({ onClose, nextOrder }: { onClose: () => void; nextOrder: number }) {
  const [name, setName] = useState(""); const [block, setBlock] = useState(""); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  async function handleSubmit() {
    const trimName = name.trim(); const trimBlock = block.trim();
    if (!trimName) { setError("กรุณาระบุชื่อโซน"); return; }
    if (!trimBlock) { setError("กรุณาระบุชื่ออาคาร/บล็อก"); return; }
    setSaving(true);
    try { await addZone({ label: `${trimName} — ${trimBlock}`, order: nextOrder }); onClose(); }
    catch (e) { setError(e instanceof Error ? e.message : "เพิ่มไม่สำเร็จ"); setSaving(false); }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-indigo-600" /><h3 className="text-base font-bold text-gray-800">เพิ่มโซนใหม่</h3></div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <div><label className="mb-1 block text-xs font-semibold text-gray-600">ชื่อโซน <span className="text-red-500">*</span></label><input value={name} onChange={(e) => { setName(e.target.value); setError(""); }} placeholder="เช่น Zone D" className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 hover:border-gray-400" /></div>
          <div><label className="mb-1 block text-xs font-semibold text-gray-600">อาคาร / บล็อก <span className="text-red-500">*</span></label><input value={block} onChange={(e) => { setBlock(e.target.value); setError(""); }} placeholder="เช่น Block 4" className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 hover:border-gray-400" /></div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">ยกเลิก</button>
          <button onClick={handleSubmit} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} เพิ่มโซน
          </button>
        </div>
      </div>
    </div>
  );
}

function AddRoomModal({ zones, defaultZoneId, onClose }: { zones: Zone[]; defaultZoneId: string; onClose: () => void }) {
  const [zoneId, setZoneId] = useState(defaultZoneId === "all" ? (zones[0]?.id ?? "") : defaultZoneId);
  const [number, setNumber] = useState(""); const [capacity, setCapacity] = useState("4"); const [status, setStatus] = useState<RoomStatus>("empty"); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  async function handleSubmit() {
    if (!zoneId) { setError("กรุณาเลือกโซน"); return; }
    if (!number.trim()) { setError("กรุณาระบุหมายเลขห้อง"); return; }
    const cap = parseInt(capacity, 10);
    if (!cap || cap < 1) { setError("กรุณาระบุจำนวนเตียงที่ถูกต้อง"); return; }
    setSaving(true);
    try { await addRoom({ number: number.trim().toUpperCase(), zoneId, occupied: 0, capacity: status === "maintenance" ? 0 : cap, status }); onClose(); }
    catch (e) { setError(e instanceof Error ? e.message : "เพิ่มไม่สำเร็จ"); setSaving(false); }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2"><BedDouble className="h-5 w-5 text-blue-600" /><h3 className="text-base font-bold text-gray-800">เพิ่มห้องพักใหม่</h3></div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <div><label className="mb-1 block text-xs font-semibold text-gray-600">โซน <span className="text-red-500">*</span></label>
            <div className="relative"><select value={zoneId} onChange={(e) => { setZoneId(e.target.value); setError(""); }} className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400"><option value="">-- เลือกโซน --</option>{zones.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /></div>
          </div>
          <div><label className="mb-1 block text-xs font-semibold text-gray-600">หมายเลขห้อง <span className="text-red-500">*</span></label><input value={number} onChange={(e) => { setNumber(e.target.value); setError(""); }} placeholder="เช่น D-401" className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400 hover:border-gray-400" /></div>
          <div><label className="mb-1 block text-xs font-semibold text-gray-600">จำนวนเตียง <span className="text-red-500">*</span></label><input type="number" min={1} max={20} value={capacity} onChange={(e) => { setCapacity(e.target.value); setError(""); }} disabled={status === "maintenance"} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400 hover:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400" /></div>
          <div><label className="mb-1 block text-xs font-semibold text-gray-600">สถานะเริ่มต้น</label>
            <div className="flex gap-2">
              {([{ value: "empty" as RoomStatus, label: "ว่าง" }, { value: "maintenance" as RoomStatus, label: "ซ่อมบำรุง" }]).map((opt) => (
                <button key={opt.value} type="button" onClick={() => { setStatus(opt.value); setError(""); }} className={`flex-1 rounded-xl border-2 py-2 text-xs font-semibold transition ${status === opt.value ? (opt.value === "maintenance" ? "border-gray-400 bg-gray-100 text-gray-700" : "border-emerald-400 bg-emerald-50 text-emerald-700") : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"}`}>{opt.label}</button>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">ยกเลิก</button>
          <button onClick={handleSubmit} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} เพิ่มห้อง
          </button>
        </div>
      </div>
    </div>
  );
}

function RoomModal({ room, onClose }: { room: Room; onClose: () => void }) {
  const cfg = STATUS_CONFIG[room.status];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl">
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${cfg.cardBg} border ${cfg.cardBorder}`}><BedDouble className={`h-6 w-6 ${cfg.textColor}`} /></div>
        <h3 className="text-lg font-bold text-gray-800">{room.number}</h3>
        <p className="mt-0.5 text-sm text-gray-500">{room.status === "maintenance" ? "ห้องนี้อยู่ระหว่างซ่อมบำรุง" : `คนอยู่ ${room.occupied} จาก ${room.capacity} เตียง`}</p>
        <div className="mt-4 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.badgeBg} ${cfg.badgeText}`}><span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />{cfg.label}</span>
        </div>
        {room.status !== "maintenance" && room.capacity > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-gray-500">การใช้เตียง</p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: room.capacity }).map((_, i) => (
                <div key={i} className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold ${i < room.occupied ? `${cfg.cardBg} ${cfg.cardBorder} border ${cfg.textColor}` : "border border-gray-200 bg-gray-50 text-gray-400"}`}>{i < room.occupied ? "●" : "○"}</div>
              ))}
            </div>
          </div>
        )}
        <button onClick={onClose} className="mt-5 w-full rounded-lg bg-gray-100 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200">ปิด</button>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  const { zones, loading: zonesLoading } = useZones();
  const { rooms, loading: roomsLoading } = useRooms();
  const [selectedZoneId, setSelectedZoneId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAddZone, setShowAddZone] = useState(false);
  const loading = zonesLoading || roomsLoading;
  const allRooms = selectedZoneId === "all" ? rooms : rooms.filter((r) => r.zoneId === selectedZoneId);
  const filteredRooms = statusFilter === "all" ? allRooms : allRooms.filter((r) => r.status === statusFilter);
  const counts = { empty: allRooms.filter((r) => r.status === "empty").length, partial: allRooms.filter((r) => r.status === "partial").length, full: allRooms.filter((r) => r.status === "full").length, maintenance: allRooms.filter((r) => r.status === "maintenance").length };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">แผนห้องพัก <span className="text-lg font-normal text-gray-400">Room Allocation</span></h1>
          <p className="mt-1 text-sm text-gray-500">ภาพรวมการใช้ห้องพักในทุกโซน</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button onClick={() => setShowAddZone(true)} className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 active:scale-95"><Plus className="h-3.5 w-3.5" />เพิ่มโซน</button>
          <button onClick={() => setShowAddRoom(true)} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"><Plus className="h-3.5 w-3.5" />เพิ่มห้องพัก</button>
        </div>
      </div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-64">
          <select value={selectedZoneId} onChange={(e) => setSelectedZoneId(e.target.value)} className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm text-gray-800 shadow-sm outline-none transition hover:border-gray-400 focus:ring-2 focus:ring-blue-500">
            <option value="all">ทุกโซน</option>
            {zones.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map(({ value, label }) => (
            <button key={value} onClick={() => setStatusFilter(value)} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${statusFilter === value ? "bg-blue-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-800"}`}>
              {label}{value !== "all" && <span className={`ml-1.5 tabular-nums ${statusFilter === value ? "text-blue-200" : "text-gray-400"}`}>{counts[value as RoomStatus]}</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {(["empty", "partial", "full", "maintenance"] as RoomStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1.5 text-xs text-gray-500"><span className={`h-3 w-3 rounded-sm ${STATUS_CONFIG[s].dotColor}`} />{STATUS_CONFIG[s].label}<span className="tabular-nums text-gray-400">({counts[s]})</span></span>
        ))}
        <span className="ml-auto text-xs text-gray-400">แสดง <span className="font-semibold text-gray-600">{filteredRooms.length}</span> ห้อง</span>
      </div>
      {loading ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2"><Loader2 className="h-8 w-8 animate-spin text-blue-400" /><p className="text-sm text-gray-400">โหลดข้อมูล...</p></div>
      ) : filteredRooms.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-center"><BedDouble className="h-8 w-8 text-gray-300" /><p className="mt-2 text-sm text-gray-400">ไม่พบห้องที่ตรงกับตัวกรองที่เลือก</p></div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          {filteredRooms.map((room) => <RoomCard key={room.id} room={room} onClick={() => setActiveRoom(room)} />)}
        </div>
      )}
      {activeRoom && <RoomModal room={activeRoom} onClose={() => setActiveRoom(null)} />}
      {showAddRoom && <AddRoomModal zones={zones} defaultZoneId={selectedZoneId} onClose={() => setShowAddRoom(false)} />}
      {showAddZone && <AddZoneModal nextOrder={zones.length} onClose={() => setShowAddZone(false)} />}
    </div>
  );
}
