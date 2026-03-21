import { useState, useEffect } from "react";
import { useVisitors, addVisitor, checkOutVisitor, type Visitor } from "@/lib/db/useVisitors";
import { UserPlus, ScanLine, LogOut, AlertTriangle, Clock, MapPin, User, X, CheckCircle } from "lucide-react";

function formatDuration(timeIn: string, now: Date): string {
  const diffMs = now.getTime() - new Date(timeIn).getTime();
  const totalMins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function isOverStay(timeIn: string, now: Date): boolean {
  return now.getTime() - new Date(timeIn).getTime() > 4 * 60 * 60 * 1000;
}

function formatTime(timeIn: string): string {
  return new Date(timeIn).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });
}

const PURPOSE_COLORS: Record<string, string> = {
  "Family Visit": "bg-blue-100 text-blue-700",
  "Document Delivery": "bg-violet-100 text-violet-700",
  "Contractor Meeting": "bg-orange-100 text-orange-700",
  "Medical Check": "bg-teal-100 text-teal-700",
};

function CheckInModal({ onClose, onAdd }: { onClose: () => void; onAdd: (v: Omit<Visitor, "id" | "timeIn" | "checkedOut">) => Promise<void> }) {
  const [form, setForm] = useState({ name: "", phone: "", purpose: "", visitingWorker: "", room: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [saving, setSaving] = useState(false);
  function set<K extends keyof typeof form>(k: K, v: string) { setForm((p) => ({ ...p, [k]: v })); if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined })); }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Partial<typeof form> = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!form.purpose.trim()) errs.purpose = "Required";
    if (!form.visitingWorker.trim()) errs.visitingWorker = "Required";
    if (!form.room.trim()) errs.room = "Required";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    await onAdd(form);
    onClose();
  }
  const inputCls = (err?: string) => `w-full rounded-xl border px-4 py-3.5 text-base outline-none transition focus:ring-2 focus:ring-blue-500 ${err ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100"><UserPlus className="h-4 w-4 text-green-600" /></div><h2 className="text-base font-semibold text-gray-800">ลงทะเบียนเข้า</h2></div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={submit} noValidate>
          <div className="space-y-4 px-5 py-5">
            <div><label className="mb-1.5 block text-sm font-medium text-gray-700">ชื่อ-นามสกุล <span className="text-red-500">*</span></label><input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="ชื่อเต็ม" className={inputCls(errors.name)} />{errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}</div>
            <div><label className="mb-1.5 block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label><input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="e.g. 081-234-5678" className={inputCls()} /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-gray-700">วัตถุประสงค์การเยี่ยม <span className="text-red-500">*</span></label><input value={form.purpose} onChange={(e) => set("purpose", e.target.value)} placeholder="เช่น เยี่ยมญาติ, ส่งเอกสาร…" className={inputCls(errors.purpose)} />{errors.purpose && <p className="mt-1 text-xs text-red-500">{errors.purpose}</p>}</div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-1.5 block text-sm font-medium text-gray-700">คนงานที่มาเยี่ยม <span className="text-red-500">*</span></label><input value={form.visitingWorker} onChange={(e) => set("visitingWorker", e.target.value)} placeholder="ชื่อคนงาน" className={inputCls(errors.visitingWorker)} />{errors.visitingWorker && <p className="mt-1 text-xs text-red-500">{errors.visitingWorker}</p>}</div>
              <div><label className="mb-1.5 block text-sm font-medium text-gray-700">ห้องพัก <span className="text-red-500">*</span></label><input value={form.room} onChange={(e) => set("room", e.target.value)} placeholder="e.g. A-101" className={inputCls(errors.room)} />{errors.room && <p className="mt-1 text-xs text-red-500">{errors.room}</p>}</div>
            </div>
          </div>
          <div className="flex gap-3 border-t border-gray-100 px-5 py-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-3.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 active:bg-gray-100">ยกเลิก</button>
            <button type="submit" disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 active:bg-green-800 disabled:opacity-60"><CheckCircle className="h-4 w-4" />{saving ? "บันทึก..." : "ยืนยันเข้า"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CheckOutConfirm({ visitor, onConfirm, onClose }: { visitor: Visitor; onConfirm: () => Promise<void>; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  async function handleConfirm() { setSaving(true); await onConfirm(); }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mx-auto"><LogOut className="h-6 w-6 text-red-600" /></div>
        <h3 className="mt-4 text-center text-lg font-bold text-gray-800">ยืนยันออก?</h3>
        <p className="mt-1 text-center text-sm text-gray-500"><span className="font-semibold text-gray-700">{visitor.name}</span> จะถูกบันทึกว่าออกจากแคมป์แล้ว</p>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} disabled={saving} className="flex-1 rounded-xl border border-gray-200 py-3.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">ยกเลิก</button>
          <button onClick={handleConfirm} disabled={saving} className="flex-1 rounded-xl bg-red-600 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 active:bg-red-800 disabled:opacity-60">{saving ? "บันทึก..." : "ยืนยัน"}</button>
        </div>
      </div>
    </div>
  );
}

function DigitalClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id); }, []);
  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");
  const dateStr = time.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-900 px-6 py-5 text-center shadow-sm">
      <p className="text-sm font-medium text-gray-400">{dateStr}</p>
      <div className="mt-1 flex items-center justify-center gap-1 font-mono">
        <span className="text-5xl font-bold tracking-tight text-white sm:text-6xl">{hours}</span>
        <span className="mb-1 text-4xl font-bold text-blue-400 sm:text-5xl">:</span>
        <span className="text-5xl font-bold tracking-tight text-white sm:text-6xl">{minutes}</span>
        <span className="mb-1 text-4xl font-bold text-blue-400 sm:text-5xl">:</span>
        <span className="text-5xl font-bold tracking-tight text-gray-400 sm:text-6xl">{seconds}</span>
      </div>
    </div>
  );
}

export default function VisitorsPage() {
  const { visitors, loading } = useVisitors();
  const [now, setNow] = useState(new Date());
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkOutTarget, setCheckOutTarget] = useState<Visitor | null>(null);
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 10000); return () => clearInterval(id); }, []);

  const activeVisitors = visitors.filter((v) => !v.checkedOut);
  const overstay = activeVisitors.filter((v) => isOverStay(v.timeIn, now));

  async function handleAddVisitor(data: Omit<Visitor, "id" | "timeIn" | "checkedOut">) {
    await addVisitor({ ...data, timeIn: new Date().toISOString(), checkedOut: false });
  }

  async function handleCheckOut(id: string) { await checkOutVisitor(id); setCheckOutTarget(null); }

  if (loading) return <div className="flex min-h-60 items-center justify-center"><p className="text-sm text-gray-400">กำลังโหลด...</p></div>;

  return (
    <div className="space-y-5 pb-6">
      <div><h1 className="text-2xl font-bold text-gray-800">ผู้มาติดต่อ <span className="text-lg font-normal text-gray-400">Visitor Management</span></h1><p className="mt-1 text-sm text-gray-500">สถานี รปภ. — ลงทะเบียนเข้า-ออกสำหรับผู้มาติดต่อ</p></div>
      <DigitalClock />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button onClick={() => setShowCheckIn(true)} className="flex items-center justify-center gap-3 rounded-2xl bg-green-600 px-6 py-6 text-xl font-bold text-white shadow-md transition hover:bg-green-700 active:scale-95 active:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-offset-2"><span className="text-2xl">🟢</span>ลงทะเบียนเข้า<UserPlus className="h-6 w-6" /></button>
        <button onClick={() => alert("QR scanner would open here in production.")} className="flex items-center justify-center gap-3 rounded-2xl bg-red-600 px-6 py-6 text-xl font-bold text-white shadow-md transition hover:bg-red-700 active:scale-95 active:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-400 focus:ring-offset-2"><span className="text-2xl">🔴</span>สแกนออก<ScanLine className="h-6 w-6" /></button>
      </div>
      {overstay.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3"><AlertTriangle className="h-5 w-5 shrink-0 text-red-500" /><p className="text-sm font-medium text-red-700">ผู้มาติดต่อ {overstay.length} ราย อยู่ในแคมป์เกิน <strong>4 ชั่วโมง</strong> ควรตรวจสอบ</p></div>
      )}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">ผู้มาติดต่อที่อยู่ในแคมป์<span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-bold text-white">{activeVisitors.length}</span></h2>
        </div>
        {activeVisitors.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white text-center"><User className="h-8 w-8 text-gray-300" /><p className="mt-2 text-sm text-gray-400">ยังไม่มีผู้มาติดต่อในขณะนี้</p></div>
        ) : (
          <div className="space-y-3">
            {activeVisitors.map((visitor) => {
              const overstayed = isOverStay(visitor.timeIn, now);
              const duration = formatDuration(visitor.timeIn, now);
              const purposeStyle = PURPOSE_COLORS[visitor.purpose] ?? "bg-gray-100 text-gray-600";
              return (
                <div key={visitor.id} className={`rounded-2xl border-2 bg-white p-5 shadow-sm transition ${overstayed ? "border-red-400 shadow-red-100" : "border-gray-200"}`}>
                  {overstayed && <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2"><AlertTriangle className="h-4 w-4 shrink-0 text-red-500" /><p className="text-xs font-semibold text-red-600">เกินเวลา — อยู่ในแคมป์ {duration}</p></div>}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">{visitor.name.charAt(0)}</div>
                      <div><p className="text-lg font-bold text-gray-800 leading-tight">{visitor.name}</p>{visitor.phone && <p className="text-sm text-gray-400">{visitor.phone}</p>}</div>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${purposeStyle}`}>{visitor.purpose}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="flex items-start gap-2"><User className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" /><div><p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">เยี่ยม</p><p className="text-sm font-semibold text-gray-700">{visitor.visitingWorker}</p></div></div>
                    <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" /><div><p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">ห้อง</p><p className="text-sm font-semibold text-gray-700">{visitor.room}</p></div></div>
                    <div className="flex items-start gap-2"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" /><div><p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">เวลาเข้า</p><p className={`text-sm font-semibold ${overstayed ? "text-red-600" : "text-gray-700"}`}>{formatTime(visitor.timeIn)}<span className="ml-1.5 text-xs font-normal text-gray-400">({duration})</span></p></div></div>
                  </div>
                  <button onClick={() => setCheckOutTarget(visitor)} className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${overstayed ? "bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-400" : "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 focus:ring-red-300"}`}><LogOut className="h-4 w-4" />ลงทะเบียนออก</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {showCheckIn && <CheckInModal onClose={() => setShowCheckIn(false)} onAdd={handleAddVisitor} />}
      {checkOutTarget && <CheckOutConfirm visitor={checkOutTarget} onConfirm={() => handleCheckOut(checkOutTarget.id)} onClose={() => setCheckOutTarget(null)} />}
    </div>
  );
}
