import { useState } from "react";
import { User, Users, Wrench, ChevronDown, Plus, X, Building2, Loader2, Pencil, Trash2, Zap, LogIn, LogOut, Calendar, Grid, Map, Info, Mars, Venus, ChevronRight, Package } from "lucide-react";
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
import {
  useOccupancyHistory,
  useElectricityHistory,
  useMaintenanceFeeHistory,
  addOccupancyRecord,
  addElectricityRecord,
  addMaintenanceFeeRecord,
  deleteElectricityRecord,
  deleteMaintenanceFeeRecord,
} from "@/lib/db/useRoomHistory";


const STATUS_CONFIG: Record<RoomStatus, { label: string; cardBg: string; cardBorder: string; cardHover: string; badgeBg: string; badgeText: string; textColor: string; dotColor: string; icon: React.ElementType }> = {
  empty:       { label: "ว่าง",      cardBg: "bg-emerald-50", cardBorder: "border-emerald-200", cardHover: "hover:bg-emerald-100 hover:border-emerald-400 hover:shadow-emerald-100", badgeBg: "bg-emerald-100", badgeText: "text-emerald-700", textColor: "text-emerald-700", dotColor: "bg-emerald-500", icon: User },
  partial:     { label: "มีผู้อยู่", cardBg: "bg-yellow-50",  cardBorder: "border-yellow-200",  cardHover: "hover:bg-yellow-100 hover:border-yellow-400 hover:shadow-yellow-100",   badgeBg: "bg-yellow-100",  badgeText: "text-yellow-700",  textColor: "text-yellow-700",  dotColor: "bg-yellow-400",  icon: Users },
  full:        { label: "เต็ม",      cardBg: "bg-red-50",     cardBorder: "border-red-200",     cardHover: "hover:bg-red-100 hover:border-red-400 hover:shadow-red-100",           badgeBg: "bg-red-100",     badgeText: "text-red-700",     textColor: "text-red-700",     dotColor: "bg-red-500",     icon: Users },
  maintenance: { label: "ซ่อมบำรุง",  cardBg: "bg-gray-100",   cardBorder: "border-gray-300",    cardHover: "hover:bg-gray-200 hover:border-gray-400 hover:shadow-gray-200",         badgeBg: "bg-gray-200",    badgeText: "text-gray-600",    textColor: "text-gray-500",    dotColor: "bg-gray-400",    icon: Wrench },
  storage:     { label: "เก็บของ",    cardBg: "bg-indigo-50",  cardBorder: "border-indigo-200",  cardHover: "hover:bg-indigo-100 hover:border-indigo-400 hover:shadow-indigo-100",   badgeBg: "bg-indigo-100",  badgeText: "text-indigo-700",  textColor: "text-indigo-700",  dotColor: "bg-indigo-500",  icon: Package },
};

function getComputedStatus(room: Room, residentsCount: number): RoomStatus {
  if (room.status === "maintenance") return "maintenance";
  if (room.status === "storage") return "storage";
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
  { value: "maintenance", label: "ซ่อมบำรุง" },
  { value: "storage",     label: "เก็บของ" },
];

function RoomCard({ room, workers, onClick, canEdit, onEdit, onDelete }: { room: Room; workers: Worker[]; onClick: () => void; canEdit?: boolean; onEdit?: () => void; onDelete?: () => void }) {
  const residents = workers.filter(w => w.roomId === room.id);
  const compStatus = getComputedStatus(room, residents.length);
  const cfg = STATUS_CONFIG[compStatus];
  const Icon = cfg.icon;
  
  const displayResidents = residents.slice(0, 3);
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
              {room.status === "maintenance" ? "ปิดซ่อมบำรุง" : room.status === "storage" ? "ห้องเก็บของ" : `${residents.length} / ${room.capacity} คน`}
            </span>
         </div>
      </div>

      {/* Residents names – compact */}
      <div className="mt-1 flex w-full flex-wrap gap-0.5">
        {room.status === "maintenance" ? (
          <span className="text-[8px] text-gray-500/70 italic">-</span>
        ) : room.status === "storage" ? (
          <span className="text-[8px] text-gray-500/70 italic">-</span>
        ) : displayResidents.length > 0 ? (
          displayResidents.map((r, i) => (
            <span key={i} className={`truncate max-w-full rounded px-1 py-px text-[8px] font-semibold leading-none bg-white/60 ${cfg.textColor}`}>
              {r.firstName} {r.lastName ? `${r.lastName.charAt(0)}.` : ""}
            </span>
          ))
        ) : (
          <span className={`text-[8px] font-medium opacity-50 italic ${cfg.textColor}`}>ว่าง</span>
        )}
        {residents.length > 3 && <span className={`text-[8px] opacity-50 ${cfg.textColor}`}>+{residents.length - 3}</span>}
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
    try { await addRoom({ number: number.trim().toUpperCase(), zoneId, occupied: 0, capacity: status === "maintenance" || status === "storage" ? 0 : cap, status }); onClose(); }
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
          <div><label className="mb-1 block text-xs font-semibold text-gray-600">ความจุ (คน) <span className="text-red-500">*</span></label><input type="number" min={1} max={20} value={capacity} onChange={(e) => { setCapacity(e.target.value); setError(""); }} disabled={status === "maintenance" || status === "storage"} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400 hover:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400" /></div>
          <div><label className="mb-1 block text-xs font-semibold text-gray-600">สถานะเริ่มต้น</label>
            <div className="flex gap-2">
              {([{ value: "empty" as RoomStatus, label: "ว่าง" }, { value: "maintenance" as RoomStatus, label: "ซ่อมบำรุง" }, { value: "storage" as RoomStatus, label: "เก็บของ" }]).map((opt) => (
                <button key={opt.value} type="button" onClick={() => { setStatus(opt.value); setError(""); }} className={`flex-1 rounded-xl border-2 py-2 text-xs font-semibold transition ${status === opt.value ? (opt.value === "maintenance" ? "border-gray-400 bg-gray-100 text-gray-700" : opt.value === "storage" ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-emerald-400 bg-emerald-50 text-emerald-700") : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"}`}>{opt.label}</button>
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


function fmt(ts: import("firebase/firestore").Timestamp | null) {
  if (!ts) return "-";
  return ts.toDate().toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "2-digit" });
}

function QuickEditWorkerModal({ worker, onClose }: { worker: Worker; onClose: () => void }) {
  const [form, setForm] = useState({
    firstName: worker.firstName || "",
    lastName: worker.lastName || "",
    gender: worker.gender || "male",
    nationality: worker.nationality || "ไทย",
    jobRole: worker.jobRole || "",
    subcontractor: worker.subcontractor || "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateWorker(worker.id, form);
      onClose();
    } catch (e) {
      alert("แก้ไขข้อมูลไม่สำเร็จ");
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-bold text-gray-800">แก้ไขข้อมูลผู้พัก</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
        </div>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-gray-600">ชื่อ</label>
              <input value={form.firstName} onChange={(e) => setForm(p => ({...p, firstName: e.target.value}))} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 hover:border-gray-400" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-gray-600">นามสกุล</label>
              <input value={form.lastName} onChange={(e) => setForm(p => ({...p, lastName: e.target.value}))} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 hover:border-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-gray-600">เพศ</label>
              <select value={form.gender} onChange={(e) => setForm(p => ({...p, gender: e.target.value}))} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 hover:border-gray-400 bg-white">
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-gray-600">สัญชาติ</label>
              <input value={form.nationality} onChange={(e) => setForm(p => ({...p, nationality: e.target.value}))} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 hover:border-gray-400" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-semibold text-gray-600">บริษัท / ผู้รับเหมา</label>
            <input value={form.subcontractor} onChange={(e) => setForm(p => ({...p, subcontractor: e.target.value}))} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 hover:border-gray-400" />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-semibold text-gray-600">ตำแหน่ง / หน้าที่</label>
            <input value={form.jobRole} onChange={(e) => setForm(p => ({...p, jobRole: e.target.value}))} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 hover:border-gray-400" />
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition cursor-pointer">ยกเลิก</button>
          <button onClick={handleSave} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition cursor-pointer disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />} บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

function RoomSidePanel({ room, workers, onClose, canEdit, onEditRoom, onDeleteRoom }: { room: Room; workers: Worker[]; onClose: () => void; canEdit?: boolean; onEditRoom?: () => void; onDeleteRoom?: () => void }) {
  const { userProfile } = useAuth();
  const isMasterAdmin = userProfile?.roles?.includes("MasterAdmin");
  const residents = workers.filter((w) => w.roomId === room.id);
  const compStatus = getComputedStatus(room, residents.length);
  const cfg = STATUS_CONFIG[compStatus];
  const unassignedWorkers = workers.filter((w) => !w.roomId);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showElecForm, setShowElecForm] = useState(false);
  const [meterVal, setMeterVal] = useState("");
  const [elecNote, setElecNote] = useState("");
  const [elecSaving, setElecSaving] = useState(false);
  const [maintCharged, setMaintCharged] = useState(false);
  const [maintNote, setMaintNote] = useState("");
  const [maintSaving, setMaintSaving] = useState(false);
  const [showMaintForm, setShowMaintForm] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const { records: occRecords, reload: reloadOccupancyHistory } = useOccupancyHistory(room.id);
  const { records: elecRecords, reload: reloadElectricityHistory } = useElectricityHistory(room.id);
  const { records: maintRecords, reload: reloadMaintenanceHistory } = useMaintenanceFeeHistory(room.id);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const fmtMonth = (m: string) => { const [y, mo] = m.split("-"); return new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString("th-TH", { month: "long", year: "numeric" }); };

  async function handleRemoveResident(w: Worker) {
    if (!window.confirm(`นำ ${w.firstName} ออกจากห้อง ${room.number}?`)) return;
    try {
      await updateWorker(w.id, { roomId: "", zoneId: "" });
      await addOccupancyRecord(room.id, { workerName: `${w.firstName} ${w.lastName}`, action: "checkout" });
      reloadOccupancyHistory();
    }
    catch { alert("นำออกไม่สำเร็จ"); }
  }
  async function handleAddResident2() {
    if (!selectedWorkerId) return;
    const w = workers.find(x => x.id === selectedWorkerId);
    try {
      await updateWorker(selectedWorkerId, { roomId: room.id, zoneId: room.zoneId });
      if (w) {
        await addOccupancyRecord(room.id, { workerName: `${w.firstName} ${w.lastName}`, action: "checkin" });
        reloadOccupancyHistory();
      }
      setSelectedWorkerId("");
      setIsAdding(false);
    }
    catch { alert("เพิ่มผู้พักไม่สำเร็จ"); }
  }
  async function handleSaveElectricity() {
    const currentReading = parseFloat(meterVal);
    if (!currentReading || currentReading <= 0) { alert("กรุณาใส่ค่ามิเตอร์ที่ถูกต้อง"); return; }
    
    setElecSaving(true);
    try { 
      const isFirstRecord = elecRecords.length === 0;
      let totalCost = 0;
      let usedUnits = 0;
      
      if (!isFirstRecord) {
        const previousReading = elecRecords[0].meterReading;
        if (currentReading <= previousReading) {
          alert(`ค่ามิเตอร์ปัจจุบันต้องมากกว่าค่ามิเตอร์ครั้งก่อน (${previousReading} หน่วย)`);
          setElecSaving(false);
          return;
        }
        usedUnits = currentReading - previousReading;
        totalCost = usedUnits * 8;
      }
      
      await addElectricityRecord(room.id, { 
        meterReading: currentReading, 
        usedUnits,
        totalCost, 
        month: currentMonth, 
        note: elecNote 
      }); 
      reloadElectricityHistory();
      setMeterVal(""); 
      setElecNote(""); 
      setShowElecForm(false); 
    }
    catch { alert("บันทึกไม่สำเร็จ"); }
    setElecSaving(false);
  }
  async function handleSaveMaintenance() {
    setMaintSaving(true);
    try { 
      const total = maintCharged ? 150 * residents.length : 0; 
      const data = { 
        month: currentMonth, 
        charged: maintCharged, 
        costPerPerson: 150, 
        occupants: residents.length, 
        totalCost: total, 
        note: maintNote 
      };
      await addMaintenanceFeeRecord(room.id, data); 
      reloadMaintenanceHistory();
      setMaintNote(""); 
      setShowMaintForm(false); 
    }
    catch (error) { 
      alert("บันทึกไม่สำเร็จ"); 
    }
    setMaintSaving(false);
  }
  
  async function handleDeleteElectricity(recordId: string, month: string) {
    if (!window.confirm(`ต้องการลบบันทึกค่าไฟฟ้า ${fmtMonth(month)} หรือไม่?`)) return;
    try { 
      await deleteElectricityRecord(room.id, recordId); 
      reloadElectricityHistory();
    }
    catch (error) { 
      alert(`ลบไม่สำเร็จ: ${error instanceof Error ? error.message : 'Unknown error'}`); 
    }
  }
  
  async function handleDeleteMaintenance(recordId: string, month: string) {
    if (!window.confirm(`ต้องการลบบันทึกค่าบำรุงรักษา ${fmtMonth(month)} หรือไม่?`)) return;
    try { 
      await deleteMaintenanceFeeRecord(room.id, recordId); 
      reloadMaintenanceHistory();
    }
    catch (error) { 
      alert(`ลบไม่สำเร็จ: ${error instanceof Error ? error.message : 'Unknown error'}`); 
    }
  }

  return (
    <>
      <div className={`fixed inset-y-0 right-0 z-40 w-full sm:w-[400px] bg-white shadow-2xl flex flex-col border-l border-gray-200 transform transition-transform duration-300 translate-x-0`}>
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 border border-white/20">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{room.number}</h3>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${cfg.badgeBg} ${cfg.badgeText}`}><span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />{cfg.label}</span>
                </div>
                <p className="text-sm text-white/60 mt-0.5">{room.status === "maintenance" ? "ปิดซ่อมบำรุง" : room.status === "storage" ? "ห้องเก็บของ" : `${residents.length} / ${room.capacity} คน`}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {canEdit && (<><button onClick={() => { onClose(); onEditRoom?.(); }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition cursor-pointer"><Pencil className="h-3.5 w-3.5" /></button><button onClick={() => { onClose(); onDeleteRoom?.(); }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button></>)}
              <button onClick={onClose} className="ml-2 flex items-center justify-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/20 transition cursor-pointer">
                พับแผง <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          {room.status !== "maintenance" && room.capacity > 0 && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-white/50"><span>อัตราการใช้ห้อง</span><span>{Math.round((residents.length / room.capacity) * 100)}%</span></div>
              <div className="h-1.5 w-full rounded-full bg-white/20"><div className="h-1.5 rounded-full bg-white transition-all duration-500" style={{ width: `${Math.min(100,(residents.length/room.capacity)*100)}%` }} /></div>
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {/* Section: ผู้พัก */}
          {room.status !== "maintenance" && room.capacity > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><div className="h-5 w-1 rounded-full bg-blue-500" /><h4 className="text-sm font-bold text-gray-800">ผู้พักปัจจุบัน</h4><span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">{residents.length}</span></div>
                {canEdit && residents.length < room.capacity && !isAdding && (<button onClick={() => setIsAdding(true)} className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition cursor-pointer"><Plus className="h-3.5 w-3.5" /> เพิ่มผู้พัก</button>)}
              </div>
              {isAdding && (
                <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50/80 p-3">
                  <p className="mb-2 text-xs font-semibold text-blue-700">เลือกผู้เข้าพัก:</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1"><select value={selectedWorkerId} onChange={(e) => setSelectedWorkerId(e.target.value)} className="w-full appearance-none rounded-lg border border-blue-200 bg-white px-3 py-2 pr-8 text-xs outline-none focus:ring-2 focus:ring-blue-500"><option value="">-- เลือกแรงงาน --</option>{unassignedWorkers.map(w => <option key={w.id} value={w.id}>{w.firstName} {w.lastName} ({w.jobRole})</option>)}</select><ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" /></div>
                    <button onClick={handleAddResident2} disabled={!selectedWorkerId} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer">เพิ่ม</button>
                    <button onClick={() => setIsAdding(false)} className="rounded-lg border border-gray-200 px-2 text-gray-400 hover:bg-gray-50 cursor-pointer"><X className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              )}
              {residents.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {residents.map((w, i) => (
                    <div key={w.id} className="group flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 hover:bg-white hover:border-gray-200 hover:shadow-sm transition">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-700 text-[10px] font-bold text-white shadow-sm">{i+1}</div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-gray-800">{w.firstName} {w.lastName}</p>
                          <p className="truncate text-[10px] text-gray-400">{w.jobRole} · {w.subcontractor}</p>
                        </div>
                      </div>
                      {canEdit && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center shrink-0">
                          <button onClick={() => setEditingWorker(w)} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer" title="แก้ไขข้อมูล">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleRemoveResident(w)} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition cursor-pointer" title="นำออก">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-6 text-gray-400"><Users className="h-6 w-6 opacity-30 mb-1" /><p className="text-xs">ยังไม่มีผู้พัก</p></div>)}
            </section>
          )}

          {/* Section: ค่าไฟฟ้า */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><div className="h-5 w-1 rounded-full bg-amber-400" /><h4 className="text-sm font-bold text-gray-800">ค่าไฟฟ้า</h4><span className="text-[10px] text-gray-400 font-medium">หน่วยละ 8 บาท</span></div>
              {canEdit && !showElecForm && (<button onClick={() => setShowElecForm(true)} className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-100 transition cursor-pointer"><Plus className="h-3.5 w-3.5" /> บันทึกมิเตอร์</button>)}
            </div>
            {showElecForm && (
              <div className="mb-3 rounded-xl border border-amber-100 bg-amber-50/70 p-4 space-y-3">
                <p className="text-xs font-bold text-amber-800">บันทึกค่ามิเตอร์ · {fmtMonth(currentMonth)}</p>
                {elecRecords.length > 0 && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
                    <p className="text-[10px] text-blue-700 font-semibold">มิเตอร์ครั้งก่อน: <span className="font-bold">{elecRecords[0].meterReading.toLocaleString()}</span> หน่วย</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <div className="flex-1"><label className="mb-1 block text-[10px] font-semibold text-amber-700">ค่ามิเตอร์ปัจจุบัน (kWh)</label><input type="number" min={0} step="0.1" value={meterVal} onChange={e => setMeterVal(e.target.value)} placeholder="เช่น 1775.5" className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400" /></div>
                  {meterVal && parseFloat(meterVal) > 0 && elecRecords.length > 0 && parseFloat(meterVal) > elecRecords[0].meterReading && (
                    <div className="flex flex-col justify-end rounded-xl bg-white border border-amber-200 px-4 py-2 text-right shrink-0">
                      <span className="text-[10px] text-gray-400">{(parseFloat(meterVal) - elecRecords[0].meterReading).toFixed(1)} หน่วย × 8</span>
                      <span className="text-base font-bold text-amber-600">{((parseFloat(meterVal) - elecRecords[0].meterReading) * 8).toLocaleString()} ฿</span>
                    </div>
                  )}
                  {meterVal && parseFloat(meterVal) > 0 && elecRecords.length === 0 && (
                    <div className="flex flex-col justify-end rounded-xl bg-white border border-blue-200 px-4 py-2 text-right shrink-0">
                      <span className="text-[10px] text-blue-600 font-semibold">บันทึกครั้งแรก</span>
                      <span className="text-sm text-gray-500">ไม่คิดค่าไฟ</span>
                    </div>
                  )}
                </div>
                <input value={elecNote} onChange={e => setElecNote(e.target.value)} placeholder="หมายเหตุ (ถ้ามี)" className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-400" />
                <div className="flex gap-2"><button onClick={handleSaveElectricity} disabled={elecSaving} className="flex-1 rounded-lg bg-amber-500 py-2 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-60 transition cursor-pointer">{elecSaving ? "กำลังบันทึก..." : "บันทึก"}</button><button onClick={() => { setShowElecForm(false); setMeterVal(""); setElecNote(""); }} className="rounded-lg border border-gray-200 px-3 py-2 text-gray-400 hover:bg-gray-50 cursor-pointer"><X className="h-3.5 w-3.5" /></button></div>
              </div>
            )}
            {elecRecords.length > 0 ? (
              <div className="relative pl-5"><div className="absolute left-2 top-0 bottom-0 w-px bg-amber-200" />
                {elecRecords.map((r, idx) => {
                  const isFirstRecord = idx === elecRecords.length - 1;
                  return (
                    <div key={r.id} className="relative mb-2.5 flex items-start gap-3 group">
                      <div className="absolute -left-3 mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 border-2 border-white shadow-sm">
                        <Zap className="h-2 w-2 text-white" />
                      </div>
                      <div className="ml-1.5 flex flex-1 flex-col rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-xs font-bold text-gray-700">{fmtMonth(r.month)}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              มิเตอร์: <span className="font-semibold text-gray-700">{r.meterReading.toLocaleString()}</span> หน่วย
                              {!isFirstRecord && r.usedUnits !== undefined && (
                                <span className="text-amber-600"> · ใช้ไป {r.usedUnits.toFixed(1)} หน่วย</span>
                              )}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {fmt(r.date)}{r.note ? ` · ${r.note}` : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              {isFirstRecord ? (
                                <span className="text-xs font-semibold text-blue-600">บันทึกครั้งแรก</span>
                              ) : (
                                <span className="text-sm font-bold text-amber-600 tabular-nums">{r.totalCost.toLocaleString()} ฿</span>
                              )}
                            </div>
                            {isMasterAdmin && (
                              <button 
                                onClick={() => handleDeleteElectricity(r.id, r.month)}
                                className="opacity-0 group-hover:opacity-100 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition cursor-pointer"
                                title="ลบรายการ"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-amber-100 py-5 text-amber-300"><Zap className="h-5 w-5 mb-1 opacity-50" /><p className="text-xs">ยังไม่มีบันทึกค่าไฟ</p></div>)}
          </section>

          {/* Section: ค่าบำรุงรักษา */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><div className="h-5 w-1 rounded-full bg-violet-400" /><h4 className="text-sm font-bold text-gray-800">ค่าบำรุงรักษา</h4><span className="text-[10px] text-gray-400 font-medium">คนละ 150 บาท</span></div>
              {canEdit && !showMaintForm && (<button onClick={() => setShowMaintForm(true)} className="flex items-center gap-1 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-600 hover:bg-violet-100 transition cursor-pointer"><Plus className="h-3.5 w-3.5" /> บันทึกประจำเดือน</button>)}
            </div>
            {showMaintForm && (
              <div className="mb-3 rounded-xl border border-violet-100 bg-violet-50/70 p-4 space-y-3">
                <p className="text-xs font-bold text-violet-800">ค่าบำรุงรักษา · {fmtMonth(currentMonth)}</p>
                <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-violet-200 bg-white px-4 py-3 hover:bg-violet-50 transition">
                  <input type="checkbox" checked={maintCharged} onChange={e => setMaintCharged(e.target.checked)} className="h-4 w-4 rounded accent-violet-600 cursor-pointer" />
                  <div><p className="text-sm font-semibold text-gray-800">เก็บค่าบำรุงรักษา</p><p className="text-[10px] text-gray-400">{maintCharged ? `${residents.length} คน × 150 = ${(residents.length*150).toLocaleString()} บาท` : "ไม่เก็บเดือนนี้"}</p></div>
                  {maintCharged && <span className="ml-auto text-base font-bold text-violet-600">{(residents.length*150).toLocaleString()} ฿</span>}
                </label>
                <input value={maintNote} onChange={e => setMaintNote(e.target.value)} placeholder="หมายเหตุ (ถ้ามี)" className="w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-violet-400" />
                <div className="flex gap-2"><button onClick={handleSaveMaintenance} disabled={maintSaving} className="flex-1 rounded-lg bg-violet-500 py-2 text-xs font-bold text-white hover:bg-violet-600 disabled:opacity-60 transition cursor-pointer">{maintSaving ? "กำลังบันทึก..." : "บันทึก"}</button><button onClick={() => { setShowMaintForm(false); setMaintNote(""); setMaintCharged(false); }} className="rounded-lg border border-gray-200 px-3 py-2 text-gray-400 hover:bg-gray-50 cursor-pointer"><X className="h-3.5 w-3.5" /></button></div>
              </div>
            )}
            {maintRecords.length > 0 ? (
              <div className="relative pl-5"><div className="absolute left-2 top-0 bottom-0 w-px bg-violet-200" />
                {maintRecords.map((r) => (
                  <div key={r.id} className="relative mb-2.5 flex items-start gap-3 group">
                    <div className={`absolute -left-3 mt-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white shadow-sm ${r.charged ? "bg-violet-500" : "bg-gray-300"}`}>
                      <span className="text-[7px] font-bold text-white">{r.charged ? "✓" : "–"}</span>
                    </div>
                    <div className="ml-1.5 flex flex-1 items-center justify-between rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-sm hover:shadow-md transition-shadow">
                      <div>
                        <p className="text-xs font-bold text-gray-700">{fmtMonth(r.month)}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{r.charged ? `เก็บค่าบำรุง · ${r.occupants} คน` : "ไม่เก็บเดือนนี้"}{r.note ? ` · ${r.note}` : ""}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold tabular-nums ${r.charged ? "text-violet-600" : "text-gray-300"}`}>{r.charged ? `${r.totalCost.toLocaleString()} ฿` : "–"}</span>
                        {isMasterAdmin && (
                          <button 
                            onClick={() => handleDeleteMaintenance(r.id, r.month)}
                            className="opacity-0 group-hover:opacity-100 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition cursor-pointer"
                            title="ลบรายการ"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-violet-100 py-5 text-violet-300"><Calendar className="h-5 w-5 mb-1 opacity-50" /><p className="text-xs">ยังไม่มีบันทึกค่าบำรุงรักษา</p></div>)}
          </section>

          {/* Section: Timeline */}
          <section>
            <div className="flex items-center gap-2 mb-3"><div className="h-5 w-1 rounded-full bg-emerald-400" /><h4 className="text-sm font-bold text-gray-800">ประวัติการเข้า-ออก</h4><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{occRecords.length}</span></div>
            {occRecords.length > 0 ? (
              <div className="relative pl-5"><div className="absolute left-2 top-0 bottom-0 w-px bg-emerald-100" />
                {occRecords.map((r) => (<div key={r.id} className="relative mb-2.5 flex items-start gap-3"><div className={`absolute -left-3 mt-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white shadow-sm ${r.action==="checkin" ? "bg-emerald-500" : "bg-orange-400"}`}>{r.action==="checkin" ? <LogIn className="h-2 w-2 text-white" /> : <LogOut className="h-2 w-2 text-white" />}</div><div className="ml-1.5 flex flex-1 items-center justify-between rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-sm"><div><p className="text-xs font-bold text-gray-700">{r.workerName}</p><p className={`text-[10px] font-semibold mt-0.5 ${r.action==="checkin" ? "text-emerald-600" : "text-orange-500"}`}>{r.action==="checkin" ? "เข้าพัก" : "ออกจากห้อง"}</p></div><span className="text-[10px] text-gray-400">{fmt(r.date)}</span></div></div>))}
              </div>
            ) : (<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-emerald-100 py-5 text-emerald-300"><LogIn className="h-5 w-5 mb-1 opacity-50" /><p className="text-xs">ยังไม่มีประวัติ</p></div>)}
          </section>
        </div>
      </div>
      {editingWorker && (
        <QuickEditWorkerModal worker={editingWorker} onClose={() => setEditingWorker(null)} />
      )}
    </>
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
        capacity: status === "maintenance" || status === "storage" ? 0 : cap, 
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
          <div><label className="mb-1 block text-xs font-semibold text-gray-600">ความจุ (คน) <span className="text-red-500">*</span></label><input type="number" min={occupiedCount > 0 ? occupiedCount : 1} max={20} value={capacity} onChange={(e) => { setCapacity(e.target.value); setError(""); }} disabled={status === "maintenance" || status === "storage"} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400 hover:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400" /></div>
          <div><label className="mb-1 block text-xs font-semibold text-gray-600">สถานะ</label>
            <div className="flex gap-2">
              {([{ value: "empty" as RoomStatus, label: "เปิดใช้งาน" }, { value: "maintenance" as RoomStatus, label: "ซ่อมบำรุง" }, { value: "storage" as RoomStatus, label: "เก็บของ" }]).map((opt) => (
                <button key={opt.value} type="button" disabled={occupiedCount > 0 && (opt.value === "maintenance" || opt.value === "storage")} onClick={() => { setStatus(opt.value); setError(""); }} className={`flex-1 rounded-xl border-2 py-2 text-xs font-semibold transition ${status === opt.value ? (opt.value === "maintenance" ? "border-gray-400 bg-gray-100 text-gray-700" : opt.value === "storage" ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-emerald-400 bg-emerald-50 text-emerald-700") : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"}`}>{opt.label}</button>
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

function CustomSiteMap({ rooms, workers, onRoomClick }: { rooms: (Room & { computedStatus: RoomStatus })[]; workers: Worker[]; onRoomClick: (r: Room) => void }) {
  // Helper to render a specific room button by its exact number (e.g. "A-5/10")
  const renderRoom = (roomNumber: string) => {
    // Normalize to ignore spaces, dashes, and leading zeros (e.g. "B - 9/01", "B9/1", "B-9/1" all become "B9/1")
    const normalize = (s: string) => s.replace(/[^A-Z0-9/]/gi, '').toUpperCase().replace(/\/0+(\d+)/, '/$1');
    const targetNorm = normalize(roomNumber);
    const room = rooms.find(r => normalize(r.number) === targetNorm);

    if (!room) {
      // If room doesn't exist in current filter/db, render an empty placeholder slot
      return (
        <div key={roomNumber} className="relative w-16 sm:w-20 md:w-24 h-auto min-h-[2rem] md:min-h-[2.5rem] p-0.5 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 bg-gray-50 rounded-md opacity-50">
          <span className="text-[8px] font-bold text-gray-400 leading-none">{roomNumber}</span>
        </div>
      );
    }

    const residents = workers.filter(w => w.roomId === room.id);
    const cfg = STATUS_CONFIG[room.computedStatus];
    
    const getWorkerLabel = (w: Worker) => {
      const sub = (w.subcontractor || "").toUpperCase();
      const isCMG = sub.includes("CMG") || sub === "DC" || w.employmentTypes?.dc;
      if (isCMG) {
         const isThai = /[ก-๛]/.test(w.firstName) || (w.nationality && w.nationality.includes("ไทย")) || (w.nationality && w.nationality.toLowerCase().includes("thai"));
         return isThai ? "DC TH" : "DC FR";
      }
      return "SUB";
    };

    const groupedResidents = residents.reduce((acc, r) => {
      const label = getWorkerLabel(r);
      if (!acc[label]) acc[label] = [];
      acc[label].push(r.gender);
      return acc;
    }, {} as Record<string, string[]>);

    return (
      <button 
        key={room.id}
        onClick={() => onRoomClick(room)}
        className={`relative w-16 sm:w-20 md:w-24 h-auto min-h-[2rem] md:min-h-[2.5rem] p-0.5 flex flex-col items-center justify-start border-2 shadow-sm rounded-md transition-all hover:scale-105 hover:z-20 cursor-pointer ${cfg.cardBg} ${cfg.cardBorder}`}
      >
        <span className={`text-[8px] font-bold ${cfg.textColor} leading-none mb-0.5`}>{room.number}</span>
        <div className="flex flex-col items-center justify-center gap-0.5 w-full">
           {residents.length === 0 && room.computedStatus !== "maintenance" && room.computedStatus !== "storage" && (
             <span className="text-[7px] font-medium text-black/30 my-px">ว่าง</span>
           )}
           {room.computedStatus === "maintenance" && (
             <Wrench className="w-2.5 h-2.5 text-gray-400 my-px" />
           )}
           {room.computedStatus === "storage" && (
             <Package className="w-2.5 h-2.5 text-indigo-400 my-px" />
           )}
           {Object.entries(groupedResidents).map(([label, genders], i) => (
             <div key={i} className="flex items-center justify-center gap-0.5 w-full text-[7px] font-bold text-gray-700 leading-none bg-white/40 rounded-sm px-0.5 py-px">
               <span className="shrink-0 whitespace-nowrap">{label}</span>
               <div className="flex flex-wrap items-center justify-center gap-px">
                 {genders.map((g, j) => g === "female" ? (
                   <Venus key={j} className="w-2 h-2 text-pink-500 shrink-0" />
                 ) : (
                   <Mars key={j} className="w-2 h-2 text-blue-500 shrink-0" />
                 ))}
               </div>
             </div>
           ))}
        </div>
      </button>
    );
  };

  // Helper arrays for descending room numbers
  const blockA5_A4 = [10,9,8,7,6,5,4,3,2,1];
  const blockA7 = [8,7,6,5,4,3,2,1];
  const blockA6 = [10,9,8,7,6,5,4,3,2,1];
  const blockA3_A2 = [10,9,8,7,6,5,4,3,2,1];

  const blockB9_detached_left = [31,32,33,34,35,36,37,38,39,40]; // Left column goes down
  const blockB9_detached_right = [30,29,28,27,26,25,24,23,22,21]; // Right column goes down
  const blockB9_main_left = [11,12,13,14,15,16,17,18,19,20];
  const blockB9_main_right = [10,9,8,7,6,5,4,3,2,1];
  const blockB8_main_left = [11,12,13,14,15,16,17,18,19,20];
  const blockB8_main_right = [10,9,8,7,6,5,4,3,2,1];

  return (
    <div className="flex flex-col gap-4 md:gap-6 overflow-x-auto pb-8 items-center bg-gray-100/50 p-2 sm:p-4 rounded-xl border border-gray-200">
      
      {/* ─── LEGEND ─── */}
      <div className="w-full max-w-4xl bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Info className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="font-bold">สัญลักษณ์บนผัง:</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded">DC TH</span> = <span className="text-gray-600">CMG (คนไทย)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded">DC FR</span> = <span className="text-gray-600">CMG (ต่างชาติ)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded">SUB</span> = <span className="text-gray-600">ผู้รับเหมา</span>
          </div>
          <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
          <div className="flex items-center gap-1.5">
            <Mars className="w-3.5 h-3.5 text-blue-500" /> = <span className="text-gray-600">ชาย</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Venus className="w-3.5 h-3.5 text-pink-500" /> = <span className="text-gray-600">หญิง</span>
          </div>
          <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
          <div className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-indigo-500" /> = <span className="text-gray-600">ห้องเก็บของ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-gray-500" /> = <span className="text-gray-600">ซ่อมบำรุง</span>
          </div>
        </div>
      </div>

      {/* ─── BLOCK A LAYOUT ─── */}
      <div className="w-full max-w-4xl">
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-500" /> BLOCK A
        </h3>
        <div className="flex flex-col xl:flex-row gap-3 md:gap-4 items-start justify-center xl:justify-start">
          <div className="flex w-fit bg-[#5d5d5d] p-2 sm:p-3 md:p-4 rounded-md shadow-md border border-[#4a4a4a] gap-2 sm:gap-3 md:gap-4 relative justify-between">
          <div className="absolute top-10 -left-2 flex flex-col items-center justify-center gap-1 hidden sm:flex">
            <div className="w-4 h-4 border border-red-500 rounded-sm bg-transparent flex items-center justify-center opacity-70">
              <div className="w-full h-px bg-red-500 absolute left-0" />
            </div>
          </div>

          {/* Left side (A5, A4, A7, A6) */}
          <div className="flex flex-col w-full">
            {/* Top: Bath & Toilet */}
            <div className="bg-cyan-400/80 h-10 flex items-center justify-center mb-3 text-[8px] md:text-[9px] font-bold text-cyan-900 tracking-widest rounded-sm shadow-sm">BATH & TOILET</div>
            
            {/* A5 & A4 */}
            <div className="flex gap-1 justify-around">
               <div className="flex flex-col gap-0.5 items-center w-full">
                 <div className="text-center text-[9px] md:text-[10px] font-bold text-gray-300 mb-0.5">A5</div>
                 {blockA5_A4.map(n => renderRoom(`A-5/${n.toString().padStart(2, '0')}`))}
               </div>
               <div className="flex flex-col gap-0.5 items-center w-full">
                 <div className="text-center text-[9px] md:text-[10px] font-bold text-gray-300 mb-0.5">A4</div>
                 {blockA5_A4.map(n => renderRoom(`A-4/${n.toString().padStart(2, '0')}`))}
               </div>
            </div>

            {/* A7 & A6 */}
            <div className="flex gap-1 mt-4 justify-around">
               <div className="flex flex-col gap-0.5 items-center w-full">
                 <div className="text-center text-[9px] md:text-[10px] font-bold text-gray-300 mb-0.5">A7</div>
                 {blockA7.map(n => renderRoom(`A-7/${n.toString().padStart(2, '0')}`))}
               </div>
               <div className="flex flex-col gap-0.5 items-center w-full">
                 <div className="text-center text-[9px] md:text-[10px] font-bold text-gray-300 mb-0.5">A6</div>
                 {blockA6.map(n => renderRoom(`A-6/${n.toString().padStart(2, '0')}`))}
               </div>
            </div>
          </div>

          {/* Corridor */}
          <div className="w-6 sm:w-10 md:w-12 bg-[#737373] shrink-0 border-x border-[#838383] flex flex-col justify-end relative">
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center hidden sm:flex">
              <div className="w-4 h-4 border border-red-500 rounded-sm bg-transparent flex items-center justify-center opacity-70">
                <div className="w-px h-full bg-red-500 absolute top-0" />
              </div>
            </div>
          </div>

          {/* Right side (A3, A2) */}
          <div className="flex flex-col w-full">
            {/* Top: Future Phase */}
            <div className="bg-[#cccccc] h-10 flex items-center justify-center mb-3 text-[8px] font-bold text-gray-500 tracking-widest rounded-sm shadow-sm">FUTURE PHASE</div>
            
            {/* A3 & A2 */}
            <div className="flex gap-1 justify-around">
               <div className="flex flex-col gap-0.5 items-center w-full">
                 <div className="text-center text-[9px] md:text-[10px] font-bold text-gray-300 mb-0.5">A3</div>
                 {blockA3_A2.map(n => renderRoom(`A-3/${n.toString().padStart(2, '0')}`))}
               </div>
               <div className="flex flex-col gap-0.5 items-center w-full">
                 <div className="text-center text-[9px] md:text-[10px] font-bold text-gray-300 mb-0.5">A2</div>
                 {blockA3_A2.map(n => renderRoom(`A-2/${n.toString().padStart(2, '0')}`))}
               </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-gray-300 max-w-4xl my-2" />

      {/* ─── BLOCK B LAYOUT ─── */}
      <div className="w-full max-w-4xl">
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-500" /> BLOCK B
        </h3>
        <div className="flex flex-col xl:flex-row gap-3 md:gap-4 items-start justify-center xl:justify-start">
          {/* Detached Left */}
          <div className="flex bg-[#5d5d5d] p-1.5 sm:p-2 rounded-md shadow-md border border-[#4a4a4a]">
            <div className="flex gap-1">
              <div className="flex flex-col gap-0.5">
                {blockB9_detached_left.map(n => renderRoom(`B-9/${n}`))}
              </div>
              <div className="flex flex-col gap-0.5">
                {blockB9_detached_right.map(n => renderRoom(`B-9/${n}`))}
              </div>
            </div>
          </div>

          {/* Main Block B */}
          <div className="flex w-fit bg-[#5d5d5d] p-2 sm:p-3 md:p-4 rounded-md shadow-md border border-[#4a4a4a] gap-2 sm:gap-3 md:gap-4 relative justify-between">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center justify-center hidden sm:flex">
               <div className="w-4 h-4 border border-red-500 rounded-sm bg-transparent flex items-center justify-center opacity-70">
                 <div className="w-px h-full bg-red-500 absolute top-0" />
               </div>
            </div>

            {/* Left (B9) */}
            <div className="flex flex-col w-full">
              <div className="text-center bg-[#8c8c8c] text-[9px] md:text-[10px] font-bold text-gray-900 py-1 mb-1.5 rounded-sm shadow-sm">B9 - FLOOR 1</div>
              <div className="flex gap-1 justify-around">
                <div className="flex flex-col gap-0.5 items-center w-full">
                  {blockB9_main_left.map(n => renderRoom(`B-9/${n.toString().padStart(2, '0')}`))}
                </div>
                <div className="flex flex-col gap-0.5 items-center w-full">
                  {blockB9_main_right.map(n => renderRoom(`B-9/${n.toString().padStart(2, '0')}`))}
                </div>
              </div>
              <div className="bg-[#cccccc] h-10 md:h-12 mt-3 flex items-center justify-center text-[8px] text-gray-500 font-bold tracking-widest rounded-sm shadow-sm">FUTURE PHASE</div>
              <div className="bg-[#cccccc] h-20 md:h-24 mt-3 flex items-center justify-center text-[8px] text-gray-500 font-bold tracking-widest rounded-sm shadow-sm">FUTURE PHASE</div>
            </div>

          {/* Corridor */}
          <div className="w-6 sm:w-10 md:w-12 bg-[#737373] shrink-0 border-x border-[#838383] flex flex-col justify-end relative">
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center hidden sm:flex">
              <div className="w-4 h-4 border border-red-500 rounded-sm bg-transparent flex items-center justify-center opacity-70">
                <div className="w-px h-full bg-red-500 absolute top-0" />
              </div>
            </div>
          </div>

            {/* Right (B8) */}
            <div className="flex flex-col w-full">
              <div className="text-center bg-[#8c8c8c] text-[9px] md:text-[10px] font-bold text-gray-900 py-1 mb-1.5 rounded-sm shadow-sm">B8 - FLOOR 1</div>
              <div className="flex gap-1 justify-around">
                <div className="flex flex-col gap-0.5 items-center w-full">
                  {blockB8_main_left.map(n => renderRoom(`B-8/${n.toString().padStart(2, '0')}`))}
                </div>
                <div className="flex flex-col gap-0.5 items-center w-full">
                  {blockB8_main_right.map(n => renderRoom(`B-8/${n.toString().padStart(2, '0')}`))}
                </div>
              </div>
              <div className="bg-cyan-400/80 h-10 md:h-12 mt-3 flex items-center justify-center text-[7px] md:text-[8px] text-cyan-900 font-bold tracking-widest rounded-sm shadow-sm">BATH&TOILET</div>
              <div className="bg-[#cccccc] h-20 md:h-24 mt-3 flex items-center justify-center text-[8px] text-gray-500 font-bold tracking-widest rounded-sm shadow-sm">FUTURE PHASE</div>
            </div>
          </div>
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
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  
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
    maintenance: enrichedRooms.filter((r) => r.computedStatus === "maintenance").length,
    storage: enrichedRooms.filter((r) => r.computedStatus === "storage").length 
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
        await Promise.all(residents.map(async (w) => {
          await updateWorker(w.id, { roomId: "", zoneId: "" });
          await addOccupancyRecord(room.id, {
            workerName: `${w.firstName} ${w.lastName}`,
            action: "checkout",
          });
        }));
      }
      await deleteRoom(room.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "ลบไม่สำเร็จ");
    }
  };

    return (
    <>
      <div className={`transition-all duration-300 ${activeRoom ? "xl:pr-[400px]" : ""}`}>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">แผนห้องพัก <span className="text-lg font-normal text-gray-400">Room Allocation</span></h1>
            <p className="mt-1 text-sm text-gray-500">ภาพรวมการใช้ห้องพักแบ่งตามแคมป์และโซน</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <div className="flex rounded-lg bg-gray-100 p-1 border border-gray-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Grid className="h-4 w-4" /> แบบการ์ด
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  viewMode === "map" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Map className="h-4 w-4" /> แบบผังห้อง
              </button>
            </div>
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
        
        {viewMode === "grid" && (
          <div className="mb-4 flex flex-wrap items-center gap-4">
            {(["empty", "partial", "full", "maintenance", "storage"] as RoomStatus[]).map((s) => (
              <span key={s} className="flex items-center gap-1.5 text-xs text-gray-500"><span className={`h-3 w-3 rounded-sm ${STATUS_CONFIG[s].dotColor}`} />{STATUS_CONFIG[s].label}<span className="tabular-nums text-gray-400">({counts[s]})</span></span>
            ))}
            <span className="ml-auto text-xs text-gray-400">แสดง <span className="font-semibold text-gray-600">{filteredRooms.length}</span> ห้อง</span>
          </div>
        )}
        
        {loading ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-2"><Loader2 className="h-8 w-8 animate-spin text-blue-400" /><p className="text-sm text-gray-400">โหลดข้อมูล...</p></div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-center"><Users className="h-8 w-8 text-gray-300" /><p className="mt-2 text-sm text-gray-400">ไม่พบห้องที่ตรงกับตัวกรองที่เลือก</p></div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {filteredRooms.map((room) => <RoomCard key={room.id} workers={workers} room={room} onClick={() => setActiveRoom(room)} canEdit={canEditRoom} onEdit={() => setRoomToEdit(room)} onDelete={() => handleDeleteRoom(room)} />)}
          </div>
        ) : (
          <CustomSiteMap rooms={filteredRooms} workers={workers} onRoomClick={(room) => setActiveRoom(room)} />
        )}
      </div>
      
      {activeRoom && <RoomSidePanel room={activeRoom} workers={workers} onClose={() => setActiveRoom(null)} canEdit={canEditRoom} onEditRoom={() => setRoomToEdit(activeRoom)} onDeleteRoom={() => handleDeleteRoom(activeRoom)} />}
      {roomToEdit && <EditRoomModal room={roomToEdit} zones={availableZones} workers={workers} onClose={() => setRoomToEdit(null)} />}
      {showAddRoom && <AddRoomModal zones={availableZones} defaultZoneId={selectedZoneId} onClose={() => setShowAddRoom(false)} />}
    </>
  );
}
