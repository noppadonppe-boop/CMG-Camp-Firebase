import { useState, useRef, useMemo, useCallback } from "react";
import { useRooms, useZones } from "@/lib/db/useRooms";
import {
  CheckCircle2, XCircle, MinusCircle, Camera, X, ChevronDown, ChevronUp,
  ClipboardCheck, AlertTriangle, Building2, Search, Send, RotateCcw,
  Info, Loader2, CloudUpload,
} from "lucide-react";
import {
  CHECKLIST, buildInitialState, getAllItems,
  type ItemStatus, type ItemState,
} from "@/lib/checklist-data";
import { submitInspection, deriveOverallStatus } from "@/lib/inspection-service";

const INSPECTOR = { id: "inspector_001", name: "สมชาย จันทร์เพ็ญ" };
const CAMP_ID = "camp_main";

const RESULT_CONFIG: Record<Exclude<ItemStatus, null>, { label: string; labelEn: string; icon: React.ElementType; active: string }> = {
  pass: { label: "ผ่าน",        labelEn: "Pass", icon: CheckCircle2, active: "bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200" },
  fail: { label: "ไม่ผ่าน",    labelEn: "Fail", icon: XCircle,      active: "bg-red-500 text-white border-red-500 shadow-sm shadow-red-200" },
  na:   { label: "ไม่เกี่ยวข้อง", labelEn: "N/A", icon: MinusCircle, active: "bg-gray-400 text-white border-gray-400 shadow-sm" },
};

function progressColor(pct: number) {
  if (pct === 100) return "bg-emerald-500";
  if (pct >= 60)   return "bg-blue-500";
  if (pct >= 30)   return "bg-amber-500";
  return "bg-gray-300";
}

function ResultButton({ value, selected, onClick }: { value: Exclude<ItemStatus, null>; selected: boolean; onClick: () => void }) {
  const cfg = RESULT_CONFIG[value];
  const Icon = cfg.icon;
  return (
    <button type="button" onClick={onClick} className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition active:scale-95 ${selected ? cfg.active : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">{cfg.label}</span>
      <span className="sm:hidden">{cfg.labelEn}</span>
    </button>
  );
}

function PhotoUpload({ preview, onChange, onClear }: { preview: string | null; onChange: (file: File, preview: string) => void; onClear: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(file, ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }
  return (
    <div className="mt-2">
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="หลักฐานภาพ" className="h-20 w-28 rounded-xl border border-gray-200 object-cover shadow-sm" />
          <button type="button" onClick={onClear} className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()} className="flex items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-400 transition hover:border-blue-400 hover:text-blue-500">
          <Camera className="h-4 w-4" />แนบรูปภาพ
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function ChecklistItemRow({ label, state, onChange }: { itemId: string; label: string; state: ItemState; onChange: (patch: Partial<ItemState>) => void }) {
  const [showNote, setShowNote] = useState(false);
  const hasIssue = state.status === "fail";
  return (
    <div className={`rounded-2xl border-2 p-4 transition ${state.status === "pass" ? "border-emerald-200 bg-emerald-50/40" : state.status === "fail" ? "border-red-200 bg-red-50/40" : state.status === "na" ? "border-gray-200 bg-gray-50/60" : "border-gray-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="flex-1 text-sm font-medium leading-snug text-gray-800">{label}</p>
        <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${state.status === "pass" ? "bg-emerald-400" : state.status === "fail" ? "bg-red-400" : state.status === "na" ? "bg-gray-300" : "bg-gray-200"}`} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(["pass", "fail", "na"] as const).map((v) => (
          <ResultButton key={v} value={v} selected={state.status === v} onClick={() => onChange({ status: state.status === v ? null : v })} />
        ))}
        <button type="button" onClick={() => setShowNote((s) => !s)} className={`ml-auto flex items-center gap-1 rounded-xl border px-3 py-2 text-xs transition ${state.note ? "border-blue-300 bg-blue-50 text-blue-600" : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"}`}>
          <Info className="h-3.5 w-3.5" />
          {state.note ? "มีหมายเหตุ" : "หมายเหตุ"}
          {showNote ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>
      {(showNote || hasIssue) && (
        <div className="mt-3 space-y-2">
          <textarea value={state.note} onChange={(e) => onChange({ note: e.target.value })} placeholder={hasIssue ? "ระบุรายละเอียดปัญหา (จำเป็น)..." : "หมายเหตุเพิ่มเติม..."} rows={2} className={`w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none transition focus:ring-2 ${hasIssue && !state.note ? "border-red-300 bg-red-50 focus:ring-red-400" : "border-gray-300 bg-white focus:ring-blue-400"}`} />
          <PhotoUpload preview={state.photoPreview} onChange={(file, preview) => onChange({ photoFile: file, photoPreview: preview })} onClear={() => onChange({ photoFile: null, photoPreview: null })} />
        </div>
      )}
    </div>
  );
}

function CategorySection({ categoryName, items, states, onChange, defaultOpen }: { categoryId: string; categoryName: string; items: { id: string; label: string }[]; states: Record<string, ItemState>; onChange: (id: string, patch: Partial<ItemState>) => void; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const answered  = items.filter((i) => states[i.id]?.status !== null).length;
  const failCount = items.filter((i) => states[i.id]?.status === "fail").length;
  const allPass   = answered === items.length && failCount === 0;
  const pct       = Math.round((answered / items.length) * 100);
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-sm">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-gray-50">
        <span className={`h-3 w-3 shrink-0 rounded-full ${failCount > 0 ? "bg-red-400" : allPass ? "bg-emerald-400" : answered > 0 ? "bg-amber-400" : "bg-gray-300"}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800">{categoryName}</p>
          <div className="mt-1 flex items-center gap-3">
            <div className="h-1.5 w-24 rounded-full bg-gray-200">
              <div className={`h-1.5 rounded-full transition-all ${progressColor(pct)}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[11px] text-gray-400">{answered}/{items.length} รายการ</span>
            {failCount > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                <XCircle className="h-3 w-3" />ไม่ผ่าน {failCount}
              </span>
            )}
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />}
      </button>
      {open && (
        <div className="space-y-3 border-t border-gray-100 p-4">
          {items.map((item) => (
            <ChecklistItemRow key={item.id} itemId={item.id} label={item.label} state={states[item.id]} onChange={(patch) => onChange(item.id, patch)} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubmitModal({ failCount, passCount, naCount, overall, onConfirm, onCancel, submittingModal, submitError }: { failCount: number; passCount: number; naCount: number; overall: "passed" | "failed" | "warning"; onConfirm: () => void; onCancel: () => void; submittingModal: boolean; submitError: string | null }) {
  const overallCfg = {
    passed:  { label: "ผ่าน",         color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    failed:  { label: "ไม่ผ่าน",      color: "text-red-600",     bg: "bg-red-50",     border: "border-red-200" },
    warning: { label: "ต้องปรับปรุง", color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200" },
  }[overall];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-gray-800">ยืนยันส่งผลการตรวจ?</h3>
        <p className="mt-1 text-sm text-gray-500">ผลการตรวจสอบสุขอนามัยห้องพักจะถูกบันทึกในระบบ</p>
        <div className={`mt-4 rounded-xl border p-4 ${overallCfg.bg} ${overallCfg.border}`}>
          <p className={`text-center text-2xl font-bold ${overallCfg.color}`}>ผล: {overallCfg.label}</p>
          <div className="mt-3 flex justify-around text-sm">
            <div className="text-center"><p className="text-xl font-bold text-emerald-600">{passCount}</p><p className="text-xs text-gray-500">ผ่าน</p></div>
            <div className="text-center"><p className="text-xl font-bold text-red-600">{failCount}</p><p className="text-xs text-gray-500">ไม่ผ่าน</p></div>
            <div className="text-center"><p className="text-xl font-bold text-gray-400">{naCount}</p><p className="text-xs text-gray-500">N/A</p></div>
          </div>
        </div>
        {failCount > 0 && <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700"><AlertTriangle className="h-4 w-4 shrink-0" />ระบบจะสร้างค่าปรับโดยอัตโนมัติสำหรับห้องที่ไม่ผ่าน</div>}
        {submitError && <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"><AlertTriangle className="h-4 w-4 shrink-0" />{submitError}</div>}
        <div className="mt-5 flex gap-3">
          <button onClick={onCancel} disabled={submittingModal} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50">ยกเลิก</button>
          <button onClick={onConfirm} disabled={submittingModal} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition disabled:opacity-60">
            {submittingModal ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}ยืนยันส่งผล
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessScreen({ roomNumber, overall, failCount, onReset }: { roomNumber: string; overall: "passed" | "failed" | "warning"; failCount: number; onReset: () => void }) {
  const cfg = {
    passed:  { icon: "✅", label: "ผ่าน",         sub: "ห้องพักผ่านการตรวจสุขอนามัย",       color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    failed:  { icon: "❌", label: "ไม่ผ่าน",      sub: "ห้องพักไม่ผ่าน — มีค่าปรับเกิดขึ้น", color: "text-red-600",     bg: "bg-red-50",     border: "border-red-200" },
    warning: { icon: "⚠️", label: "ต้องปรับปรุง", sub: "ห้องพักผ่านแต่ต้องปรับปรุง",         color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200" },
  }[overall];
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 text-4xl ${cfg.bg} ${cfg.border}`}>{cfg.icon}</div>
      <h2 className={`text-2xl font-bold ${cfg.color}`}>ผล: {cfg.label}</h2>
      <p className="mt-1 text-gray-500">{cfg.sub}</p>
      <div className="mt-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">ห้อง {roomNumber}</div>
      {failCount > 0 && <p className="mt-3 text-sm text-red-500">มี {failCount} รายการที่ไม่ผ่าน — ค่าปรับถูกสร้างในระบบบิลแล้ว</p>}
      <button onClick={onReset} className="mt-8 flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition">
        <RotateCcw className="h-4 w-4" />ตรวจห้องถัดไป
      </button>
    </div>
  );
}

export default function HygieneInspectPage() {
  const { rooms, loading: roomsLoading } = useRooms();
  const { zones } = useZones();
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [roomSearch, setRoomSearch]         = useState("");
  const [states, setStates]                 = useState<Record<string, ItemState>>(buildInitialState());
  const [generalNote, setGeneralNote]       = useState("");
  const [showConfirm, setShowConfirm]       = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [submitError, setSubmitError]       = useState<string | null>(null);
  const [submitted, setSubmitted]           = useState(false);

  const allItems  = useMemo(() => getAllItems(), []);
  const total     = allItems.length;
  const answered  = allItems.filter((i) => states[i.id]?.status !== null).length;
  const passCount = allItems.filter((i) => states[i.id]?.status === "pass").length;
  const failCount = allItems.filter((i) => states[i.id]?.status === "fail").length;
  const naCount   = allItems.filter((i) => states[i.id]?.status === "na").length;
  const pct       = Math.round((answered / total) * 100);
  const overall   = deriveOverallStatus(failCount);

  const roomsWithZone = useMemo(() => rooms.map((r) => ({
    ...r,
    zone: zones.find((z) => z.id === r.zoneId)?.label ?? r.zoneId,
  })), [rooms, zones]);

  const selectedRoom = roomsWithZone.find((r) => r.id === selectedRoomId);
  const failsWithoutNote = allItems.filter((i) => states[i.id]?.status === "fail" && !states[i.id]?.note.trim());
  const canSubmit = !!selectedRoomId && answered === total && failsWithoutNote.length === 0;

  const filteredRooms = roomsWithZone.filter((r) =>
    r.number.toLowerCase().includes(roomSearch.toLowerCase()) ||
    r.zone.toLowerCase().includes(roomSearch.toLowerCase())
  );

  const updateItem = useCallback((id: string, patch: Partial<ItemState>) => {
    setStates((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);

  function handleReset() {
    setStates(buildInitialState());
    setGeneralNote("");
    setSelectedRoomId("");
    setRoomSearch("");
    setSubmitted(false);
    setSubmitError(null);
  }

  async function handleConfirmSubmit() {
    if (!selectedRoom) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitInspection({
        campId: CAMP_ID, roomId: selectedRoom.id, roomNumber: selectedRoom.number,
        zone: selectedRoom.zone, inspectorId: INSPECTOR.id, inspectorName: INSPECTOR.name,
        generalNote, itemStates: states,
      });
      setShowConfirm(false);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted && selectedRoom) {
    return <SuccessScreen roomNumber={selectedRoom.number} overall={overall} failCount={failCount} onReset={handleReset} />;
  }

  if (roomsLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-400" /></div>;
  }

  return (
    <div className="pb-32">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ตรวจสุขอนามัย <span className="text-lg font-normal text-gray-400">Hygiene Inspection</span></h1>
        <p className="mt-1 text-sm text-gray-500">กรอกผลการตรวจสอบความสะอาดและสุขอนามัยในแต่ละห้องพัก</p>
      </div>

      {/* Room selector */}
      <div className="mb-6 rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h2 className="text-sm font-bold text-gray-700">เลือกห้องที่ต้องการตรวจ</h2>
          <span className="text-red-500 text-sm">*</span>
        </div>
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={roomSearch} onChange={(e) => setRoomSearch(e.target.value)} placeholder="ค้นหาห้อง..." className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm outline-none hover:border-gray-400 focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {filteredRooms.map((room) => (
            <button key={room.id} type="button" onClick={() => { handleReset(); setSelectedRoomId(room.id); }} className={`rounded-xl border-2 px-3 py-3 text-left transition active:scale-95 ${selectedRoomId === room.id ? "border-blue-500 bg-blue-50 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"}`}>
              <p className={`text-sm font-bold ${selectedRoomId === room.id ? "text-blue-700" : "text-gray-800"}`}>{room.number}</p>
              <p className="text-[11px] text-gray-400">{room.zone}</p>
            </button>
          ))}
        </div>
        {selectedRoom && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5">
            <ClipboardCheck className="h-4 w-4 text-blue-500 shrink-0" />
            <p className="text-sm text-blue-700">กำลังตรวจห้อง <strong>{selectedRoom.number}</strong>{" — "}{selectedRoom.zone}</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {selectedRoomId && (
        <div className="mb-5">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-600">ความคืบหน้า</span>
            <span className="tabular-nums font-semibold text-blue-600">{answered}/{total} รายการ</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-gray-200">
            <div className={`h-2.5 rounded-full transition-all duration-300 ${progressColor(pct)}`} style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" />ผ่าน {passCount}</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" />ไม่ผ่าน {failCount}</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-300" />N/A {naCount}</span>
          </div>
        </div>
      )}

      {!selectedRoomId && (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white text-center">
          <ClipboardCheck className="h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-400">เลือกห้องพักด้านบนเพื่อเริ่มตรวจสอบ</p>
        </div>
      )}

      {selectedRoomId && (
        <div className="space-y-4">
          {CHECKLIST.map((cat, idx) => (
            <CategorySection key={cat.categoryId} categoryId={cat.categoryId} categoryName={cat.categoryName} items={cat.items} states={states} onChange={updateItem} defaultOpen={idx === 0} />
          ))}
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-gray-700">หมายเหตุรวม (ไม่บังคับ)</h3>
            <textarea value={generalNote} onChange={(e) => setGeneralNote(e.target.value)} placeholder="สรุปสภาพทั่วไปของห้องพัก หรือข้อสังเกตอื่นๆ..." rows={3} className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none hover:border-gray-400 focus:ring-2 focus:ring-blue-400" />
          </div>
          {failsWithoutNote.length > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <div className="text-sm text-red-700">
                <p className="font-semibold">กรุณาระบุหมายเหตุสำหรับรายการที่ไม่ผ่าน:</p>
                <ul className="mt-1 list-disc pl-4 space-y-0.5">{failsWithoutNote.map((i) => <li key={i.id}>{i.label}</li>)}</ul>
              </div>
            </div>
          )}
          {answered < total && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
              <p className="text-sm text-amber-700">ยังมี <strong>{total - answered} รายการ</strong> ที่ยังไม่ได้ประเมิน</p>
            </div>
          )}
        </div>
      )}

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:left-60">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div className="text-sm text-gray-500 hidden sm:block">
            {selectedRoom ? <span>ห้อง <strong className="text-gray-800">{selectedRoom.number}</strong>{" · "}ตอบแล้ว <strong className="text-blue-600">{answered}/{total}</strong></span> : <span className="text-gray-400">ยังไม่ได้เลือกห้อง</span>}
          </div>
          <div className="flex gap-3 ml-auto">
            <button type="button" onClick={handleReset} className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              <RotateCcw className="h-4 w-4" />ล้างข้อมูล
            </button>
            <button type="button" onClick={() => setShowConfirm(true)} disabled={!canSubmit} className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition active:scale-95 ${canSubmit ? "bg-blue-600 text-white hover:bg-blue-700" : "cursor-not-allowed bg-gray-100 text-gray-400"}`}>
              <Send className="h-4 w-4" />ส่งผลการตรวจ
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <SubmitModal passCount={passCount} failCount={failCount} naCount={naCount} overall={overall} onConfirm={handleConfirmSubmit} onCancel={() => { if (!submitting) setShowConfirm(false); }} submittingModal={submitting} submitError={submitError} />
      )}
    </div>
  );
}
