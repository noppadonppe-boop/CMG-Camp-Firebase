import { useState } from "react";
import { BedDouble, User, Users, Wrench, ChevronDown, Plus, X, Building2, Loader2, Pencil, Trash2, MapPin } from "lucide-react";
import {
  useRooms,
  useZones,
  addRoom,
  updateRoom,
  deleteRoom,
  type Room,
  type Zone,
  type RoomStatus,
} from "@/lib/db/useRooms";
import { useCamps } from "@/lib/db/useCamps";
import { useWorkers, updateWorker, type Worker } from "@/lib/db/useWorkers";
import { useAuth } from "@/context/AuthContext";


const STATUS_CONFIG: Record<RoomStatus, { label: string; cardBg: string; cardBorder: string; cardHover: string; badgeBg: string; badgeText: string; textColor: string; dotColor: string; icon: React.ElementType }> = {
  empty:       { label: "ว่าง",      cardBg: "bg-emerald-50", cardBorder: "border-emerald-200", cardHover: "hover:bg-emerald-100 hover:border-emerald-400 hover:shadow-emerald-100", badgeBg: "bg-emerald-100", badgeText: "text-emerald-700", textColor: "text-emerald-700", dotColor: "bg-emerald-500", icon: User },
  partial:     { label: "มีผู้อยู่", cardBg: "bg-yellow-50",  cardBorder: "border-yellow-200",  cardHover: "hover:bg-yellow-100 hover:border-yellow-400 hover:shadow-yellow-100",   badgeBg: "bg-yellow-100",  badgeText: "text-yellow-700",  textColor: "text-yellow-700",  dotColor: "bg-yellow-400",  icon: Users },
  full:        { label: "เต็ม",      cardBg: "bg-red-50",     cardBorder: "border-red-200",     cardHover: "hover:bg-red-100 hover:border-red-400 hover:shadow-red-100",           badgeBg: "bg-red-100",     badgeText: "text-red-700",     textColor: "text-red-700",     dotColor: "bg-red-500",     icon: Users },
  maintenance: { label: "ซ่อมบำรุง",  cardBg: "bg-gray-100",   cardBorder: "border-gray-300",    cardHover: "hover:bg-gray-200 hover:border-gray-400 hover:shadow-gray-200",         badgeBg: "bg-gray-200",    badgeText: "text-gray-600",    textColor: "text-gray-500",    dotColor: "bg-gray-400",    icon: Wrench },
};

function getComputedStatus(room: Room, residentsCount: number): RoomStatus {
  if (room.status === "maintenance") return "maintenance";
  if (residentsCount === 0) return "empty";
  if (residentsCount >= room.capacity) return "full";
  return "partial";
}

type StatusFilter = "all" | RoomStatus;
const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all",         label: "ทั้งหมด" },
  { value: "empty",       label: "ว่าง" },
  { value: "partial",     label: "มีผู้อยู่บางส่วน" },
  { value: "full",        label: "เต็ม" },
  { value: "maintenance", label: "ซ่อมบำรุ" },
];

function RoomCard({ room, workers, onClick, canEdit, onEdit, onDelete }: { room: Room; workers: Worker[]; onClick: () => void; canEdit?: boolean; onEdit?: () => void; onDelete?: () => void }) {
  const residents = workers.filter(w => w.roomId === room.id);
  const compStatus = getComputedStatus(room, residents.length);
  const cfg = STATUS_CONFIG[compStatus];
  const Icon = cfg.icon;
  
  return (
    <button onClick={onClick} className={`group relative flex w-full flex-col items-start rounded-2xl border p-2.5 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${cfg.cardBg} ${cfg.cardBorder} ${cfg.cardHover}`}>
      
      {/* Header */}
      <div className="flex w-full items-start justify-between gap-1">
        <div className="flex flex-col items-start gap-1">
          <span className={`text-base font-extrabold tracking-tight leading-none ${cfg.textColor}`}>{room.number}</span>
          <span className={`inline-flex items-center gap-1 rounded-full bg-white/60 px-1.5 py-0.5 text-[9px] font-bold shadow-sm ${cfg.textColor}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />
            {cfg.label}
          </span>
        </div>
        
        {canEdit ? (
          <div className="flex shrink-0 gap-0.5" onClick={(e) => e.stopPropagation()}>
             <div onClick={onEdit} className="flex p-1.5 rounded-lg hover:bg-white/80 text-blue-600 transition active:scale-95"><Pencil className="h-3.5 w-3.5"/></div>
             <div onClick={onDelete} className="flex p-1.5 rounded-lg hover:bg-white/80 text-red-500 transition active:scale-95"><Trash2 className="h-3.5 w-3.5"/></div>
          </div>
        ) : (
          <Icon className={`h-4 w-4 shrink-0 ${cfg.textColor} opacity-60 mt-0.5`} />
        )}
      </div>

      {/* Capacity info */}
      <div className="mt-2.5 flex w-full items-center justify-between border-t border-black/5 pt-2">
          <div className="flex items-center gap-1.5 opacity-90">
            <Users className={`h-3.5 w-3.5 ${cfg.textColor}`} />
            <span className={`text-[10px] font-bold tabular-nums tracking-wide ${cfg.textColor}`}>
              {room.status === "maintenance" ? "ปิดซ่อมบำรุง" : `${residents.length} / ${room.capacity} คน`}
            </span>
         </div>
      </div>

      {/* Residents names */}
      <div className="mt-1.5 flex w-full flex-wrap gap-1">
        {room.status === "maintenance" ? (
          <span className="text-[10px] text-gray-500/70 italic">-</span>
        ) : residents.length > 0 ? (
          residents.map((r, i) => (
            <span key={i} className={`truncate max-w-full rounded border border-black/5 bg-white/70 px-1.5 py-0.5 text-[9px] font-semibold leading-none shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${cfg.textColor}`}>
              {r.firstName} {r.lastName ? `${r.lastName.charAt(0)}.` : ""}
            </span>
          ))
        ) : (
          <span className={`text-[9px] font-medium opacity-60 italic ${cfg.textColor}`}>-- ไม่มีผู้พัก --</span>
        )}
      </div>
    </button>
  );
}


function AddRoomModal({ zones, defaultZoneId, onClose }: { zones: Zone[]; defaultZoneId: string; onClose: () => void }) {
  const [zoneId, setZoneId] = useState(defaultZoneId === "all" ? (zones[0]?.id ?? "") : defaultZoneId);
  const [number, setNumber] = useState(""); const [capacity, setCapacity] = useState("4"); const [status, setStatus] = useState<RoomStatus>("empty"); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  async function handleSubmit() {
    if (!zoneId) { setError("กรุณาเลือกโซน"); return; }
    if (!number.trim()) { setError("กรุณาระบุหมายเลขห้อง"); return; }
    const cap = parseInt(capacity, 10);
    if (!cap || cap < 1) { setError("กรุณาระบุจำนวนคนที่ถูกต้อง"); return; }
    setSaving(true);
    try { await addRoom({ number: number.trim().toUpperCase(), zoneId, occupied: 0, capacity: status === "maintenance" ? 0 : cap, status }); onClose(); }
    catch (e) { setError(e instanceof Error ? e.message : "เพิ่มไม่สำเร็จ"); setSaving(false); }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-blue-600" /><h3 className="text-base font-bold text-gray-800">เพิ่มห้องพักใหม่</h3></div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <div><label className="mb-1 block text-xs font-semibold text-gray-600">โซน <span className="text-red-500">*</span></label>
            <div className="relative"><select value={zoneId} onChange={(e) => { setZoneId(e.target.value); setError(""); }} className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400"><option value="">-- เลือกโซน --</option>{zones.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /></div>
          </div>
          <div><label className="mb-1 block text-xs font-semibold text-gray-600">หมายเลขห้อง <span className="text-red-500">*</span></label><input value={number} onChange={(e) => { setNumber(e.target.value); setError(""); }} placeholder="เช่น D-401" className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400 hover:border-gray-400" /></div>
          <div><label className="mb-1 block text-xs font-semibold text-gray-600">ความจุ (คน) <span className="text-red-500">*</span></label><input type="number" min={1} max={20} value={capacity} onChange={(e) => { setCapacity(e.target.value); setError(""); }} disabled={status === "maintenance"} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400 hover:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400" /></div>
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

function RoomModal({ room, workers, onClose, canEdit, onEditRoom, onDeleteRoom }: { room: Room; workers: Worker[]; onClose: () => void; canEdit?: boolean; onEditRoom?: () => void; onDeleteRoom?: () => void }) {
  const residents = workers.filter((w) => w.roomId === room.id);
  const compStatus = getComputedStatus(room, residents.length);
  const cfg = STATUS_CONFIG[compStatus];
  
  const unassignedWorkers = workers.filter((w) => !w.roomId);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  async function handleAddResident() {
    if (!selectedWorkerId) return;
    try {
      await updateWorker(selectedWorkerId, { roomId: room.id, zoneId: room.zoneId });
      setSelectedWorkerId("");
      setIsAdding(false);
    } catch (err) {
      alert("เพิ่มผู้พักไม่สำเร็จ");
    }
  }

  async function handleRemoveResident(w: Worker) {
    if (window.confirm(`ต้องการนำคุณ ${w.firstName} ออกจากห้อง ${room.number} หรือไม่?`)) {
      try {
        await updateWorker(w.id, { roomId: "", zoneId: "" });
      } catch (err) {
        alert("นำออกไม่สำเร็จ");
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${cfg.cardBg} border ${cfg.cardBorder}`}>
              <Users className={`h-6 w-6 ${cfg.textColor}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{room.number}</h3>
              <p className="text-sm font-medium text-gray-500">{room.status === "maintenance" ? "ซ่อมบำรุง" : `${residents.length} / ${room.capacity} คน`}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {canEdit && (
              <>
                <button onClick={() => { onClose(); onEditRoom?.(); }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer" title="แก้ไขข้อมูลห้องพัก"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => { onClose(); onDeleteRoom?.(); }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer" title="ลบห้องพัก"><Trash2 className="h-4 w-4" /></button>
              </>
            )}
            <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 ml-2 cursor-pointer"><X className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="mb-5 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText}`}><span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />{cfg.label}</span>
        </div>

        {/* Residents Section */}
        {room.status !== "maintenance" && room.capacity > 0 && (
          <div className="mt-2 space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">รายชื่อผู้พัก ({residents.length})</p>
                {canEdit && residents.length < room.capacity && !isAdding && (
                  <button onClick={() => setIsAdding(true)} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                    <Plus className="h-3.5 w-3.5" /> ดึงรายชื่อจากผู้ลงทะเบียน
                  </button>
                )}
              </div>
              
              {isAdding && (
                <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
                  <p className="mb-2 text-xs font-semibold text-blue-800">เลือกผู้เข้าพักมาเติม:</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select value={selectedWorkerId} onChange={(e) => setSelectedWorkerId(e.target.value)} className="w-full appearance-none rounded-lg border border-blue-200 bg-white px-3 py-2.5 pr-8 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">-- เลือกแรงงานที่ไม่มีห้อง --</option>
                        {unassignedWorkers.map(w => <option key={w.id} value={w.id}>{w.firstName} {w.lastName} ({w.jobRole})</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                    <button onClick={handleAddResident} disabled={!selectedWorkerId} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer shadow-sm">เพิ่ม</button>
                    <button onClick={() => setIsAdding(false)} className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-gray-500 transition hover:bg-gray-50 cursor-pointer"><X className="h-4 w-4" /></button>
                  </div>
                  {unassignedWorkers.length === 0 && <p className="mt-1.5 text-[10px] text-red-500">* ไม่มีแรงงานใหม่ว่างเลย (ต้องลงทะเบียนก่อน)</p>}
                </div>
              )}

              {residents.length > 0 ? (
                <div className="space-y-2">
                  {residents.map((w, i) => (
                    <div key={w.id} className="group flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 transition hover:border-gray-200 hover:bg-white shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-gray-500 shadow-sm border border-gray-100">{i + 1}</div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-gray-800">{w.firstName} {w.lastName}</p>
                          <p className="truncate text-[10.5px] font-medium text-gray-400 mt-0.5">{w.jobRole} · {w.subcontractor}</p>
                        </div>
                      </div>
                      {canEdit && (
                        <button onClick={() => handleRemoveResident(w)} title="นำออกจากห้อง" className="opacity-0 group-hover:opacity-100 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 py-6 text-center text-gray-400">
                  <Users className="mx-auto mb-2 h-6 w-6 opacity-30" />
                  <p className="text-xs">ยังไม่มีผู้พัก</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EditRoomModal({ room, zones, workers, onClose }: { room: Room; zones: Zone[]; workers: Worker[]; onClose: () => void }) {
  const [zoneId, setZoneId] = useState(room.zoneId);
  const [number, setNumber] = useState(room.number); 
  const occupiedCount = workers.filter(w => w.roomId === room.id).length;
  const [capacity, setCapacity] = useState(room.capacity.toString()); 
  const [status, setStatus] = useState<RoomStatus>(room.status); 
  const [error, setError] = useState(""); 
  const [saving, setSaving] = useState(false);
  
  async function handleSubmit() {
    if (!zoneId) { setError("กรุณาเลือกโซน"); return; }
    if (!number.trim()) { setError("กรุณาระบุหมายเลขห้อง"); return; }
    const cap = parseInt(capacity, 10);
    if (!cap || cap < 1) { setError("กรุณาระบุจำนวนคนที่ถูกต้อง"); return; }
    if (cap < occupiedCount) { setError(`ความจุต้องไม่น้อยกว่าผู้อยู่ปัจจุบัน (${occupiedCount})`); return; }
    
    setSaving(true);
    try { 
      await updateRoom(room.id, { 
        number: number.trim().toUpperCase(), 
        zoneId, 
        capacity: status === "maintenance" ? 0 : cap, 
        status 
      }); 
      onClose(); 
    } catch (e) { 
      setError(e instanceof Error ? e.message : "แก้ไขไม่สำเร็จ"); 
      setSaving(false); 
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2"><Pencil className="h-5 w-5 text-blue-600" /><h3 className="text-base font-bold text-gray-800">แก้ไขห้องพัก</h3></div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <div><label className="mb-1 block text-xs font-semibold text-gray-600">โซน <span className="text-red-500">*</span></label>
            <div className="relative"><select value={zoneId} onChange={(e) => { setZoneId(e.target.value); setError(""); }} className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400"><option value="">-- เลือกโซน --</option>{zones.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /></div>
          </div>
          <div><label className="mb-1 block text-xs font-semibold text-gray-600">หมายเลขห้อง <span className="text-red-500">*</span></label><input value={number} onChange={(e) => { setNumber(e.target.value); setError(""); }} placeholder="เช่น D-401" className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400 hover:border-gray-400" /></div>
          <div><label className="mb-1 block text-xs font-semibold text-gray-600">ความจุ (คน) <span className="text-red-500">*</span></label><input type="number" min={occupiedCount > 0 ? occupiedCount : 1} max={20} value={capacity} onChange={(e) => { setCapacity(e.target.value); setError(""); }} disabled={status === "maintenance"} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400 hover:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400" /></div>
          <div><label className="mb-1 block text-xs font-semibold text-gray-600">สถานะ</label>
            <div className="flex gap-2">
              {([{ value: "empty" as RoomStatus, label: "เปิดใช้งาน" }, { value: "maintenance" as RoomStatus, label: "ซ่อมบำรุง" }]).map((opt) => (
                <button key={opt.value} type="button" disabled={occupiedCount > 0 && opt.value === "maintenance"} onClick={() => { setStatus(opt.value); setError(""); }} className={`flex-1 rounded-xl border-2 py-2 text-xs font-semibold transition ${status === opt.value ? (opt.value === "maintenance" ? "border-gray-400 bg-gray-100 text-gray-700" : "border-emerald-400 bg-emerald-50 text-emerald-700") : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"}`}>{opt.label}</button>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">ยกเลิก</button>
          <button onClick={handleSubmit} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />} บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  const { userProfile } = useAuth();
  const canEditRoom = userProfile?.roles?.includes("CampBoss") || userProfile?.roles?.includes("MasterAdmin");
  const { camps, loading: campsLoading } = useCamps();
  const { zones, loading: zonesLoading } = useZones();
  const { rooms, loading: roomsLoading } = useRooms();
  const { workers } = useWorkers();
  
  const [selectedCampId, setSelectedCampId] = useState<string>("all");
  const [selectedZoneId, setSelectedZoneId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);
  const [showAddRoom, setShowAddRoom] = useState(false);
  
  const loading = zonesLoading || roomsLoading || campsLoading;
  
  const availableZones = selectedCampId === "all" ? zones : zones.filter(z => z.campId === selectedCampId);
  const allRooms = selectedZoneId === "all" 
      ? rooms.filter(r => availableZones.some(z => z.id === r.zoneId)) 
      : rooms.filter((r) => r.zoneId === selectedZoneId);

  const enrichedRooms = allRooms.map((r) => {
    const occ = workers.filter(w => w.roomId === r.id).length;
    return { ...r, computedStatus: getComputedStatus(r, occ) };
  });

  const filteredRooms = statusFilter === "all" ? enrichedRooms : enrichedRooms.filter((r) => r.computedStatus === statusFilter);
  const counts = { 
    empty: enrichedRooms.filter((r) => r.computedStatus === "empty").length, 
    partial: enrichedRooms.filter((r) => r.computedStatus === "partial").length, 
    full: enrichedRooms.filter((r) => r.computedStatus === "full").length, 
    maintenance: enrichedRooms.filter((r) => r.computedStatus === "maintenance").length 
  };

  const handleDeleteRoom = async (room: Room) => {
    if (room.occupied > 0) {
      if (!window.confirm(`ห้องนี้มีผู้พักอาศัยอยู่ ${room.occupied} คน\nการลบห้องนี้จะเคลียร์ผู้คนเหล่านี้ออกจากห้องโดยอัตโนมัติ\nคุณยืนยันที่จะลบห้อง ${room.number} หรือไม่?`)) {
        return;
      }
    } else {
      if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบห้อง ${room.number}?`)) {
        return;
      }
    }
    
    try {
      if (room.occupied > 0) {
        const residents = workers.filter((w) => w.roomId === room.id);
        await Promise.all(residents.map((w) => updateWorker(w.id, { roomId: "", zoneId: "" })));
      }
      await deleteRoom(room.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "ลบไม่สำเร็จ");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">แผนห้องพัก <span className="text-lg font-normal text-gray-400">Room Allocation</span></h1>
          <p className="mt-1 text-sm text-gray-500">ภาพรวมการใช้ห้องพักแบ่งตามแคมป์และโซน</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button onClick={() => setShowAddRoom(true)} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95">
            <Plus className="h-4 w-4" /> เพิ่มห้องพัก
          </button>
        </div>
      </div>
      
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-56">
            <select value={selectedCampId} onChange={(e) => { setSelectedCampId(e.target.value); setSelectedZoneId("all"); }} className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm font-semibold text-blue-800 shadow-sm outline-none transition hover:border-blue-300 focus:ring-2 focus:ring-blue-500 cursor-pointer">
              <option value="all">ทุกแคมป์ (All Camps)</option>
              {camps.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="relative w-full sm:w-48">
            <select value={selectedZoneId} onChange={(e) => setSelectedZoneId(e.target.value)} className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm text-gray-800 shadow-sm outline-none transition hover:border-gray-400 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed" disabled={availableZones.length === 0}>
              <option value="all">ทุกโซนในแคมป์</option>
              {availableZones.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
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
        <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-center"><Users className="h-8 w-8 text-gray-300" /><p className="mt-2 text-sm text-gray-400">ไม่พบห้องที่ตรงกับตัวกรองที่เลือก</p></div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
          {filteredRooms.map((room) => <RoomCard key={room.id} workers={workers} room={room} onClick={() => setActiveRoom(room)} canEdit={canEditRoom} onEdit={() => setRoomToEdit(room)} onDelete={() => handleDeleteRoom(room)} />)}
        </div>
      )}
      {activeRoom && <RoomModal room={activeRoom} workers={workers} onClose={() => setActiveRoom(null)} canEdit={canEditRoom} onEditRoom={() => setRoomToEdit(activeRoom)} onDeleteRoom={() => handleDeleteRoom(activeRoom)} />}
      {roomToEdit && <EditRoomModal room={roomToEdit} zones={availableZones} workers={workers} onClose={() => setRoomToEdit(null)} />}
      {showAddRoom && <AddRoomModal zones={availableZones} defaultZoneId={selectedZoneId} onClose={() => setShowAddRoom(false)} />}
    </div>
  );
}
