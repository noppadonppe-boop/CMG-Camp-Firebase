import { useState, useMemo } from "react";
import { useZones, useRooms } from "@/lib/db/useRooms";
import { addWorker, updateWorker, deleteWorker, useWorkers, type Worker } from "@/lib/db/useWorkers";
import {
  User, Upload, CheckCircle, Loader2, ChevronDown, Plus, X,
  Search, BedDouble, Users, ChevronRight, Pencil, Trash2, AlertTriangle,
} from "lucide-react";

type DocType = "national-id" | "passport" | "work-permit";
type Gender = "male" | "female";

const DOC_LABELS: Record<DocType, string> = { "national-id": "บัตรประชาชน", passport: "หนังสือเดินทาง", "work-permit": "ใบอนุญาตทำงาน" };
const GENDER_LABELS: Record<string, string> = { male: "ชาย", female: "หญิง" };

interface FormState {
  idNumber: string; docType: DocType;
  firstName: string; lastName: string; gender: Gender; nationality: string; phone: string;
  subcontractor: string; jobRole: string; startDate: string;
  zoneId: string; roomId: string;
}

const EMPTY: FormState = { idNumber: "", docType: "national-id", firstName: "", lastName: "", gender: "male", nationality: "ไทย", phone: "", subcontractor: "", jobRole: "", startDate: "", zoneId: "", roomId: "" };

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}{required && <span className="ml-1 text-red-500">*</span>}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SectionTitle({ n, title, sub }: { n: number; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{n}</div>
      <div><p className="text-sm font-semibold text-gray-800">{title}</p><p className="text-xs text-gray-500">{sub}</p></div>
    </div>
  );
}

const inputCls = (err?: string) => `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 hover:border-gray-400 ${err ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`;
const selectCls = (err?: string) => `w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 hover:border-gray-400 bg-white ${err ? "border-red-400" : "border-gray-300"}`;

function RegisterModal({ onClose, zones, rooms }: { onClose: () => void; zones: ReturnType<typeof useZones>["zones"]; rooms: ReturnType<typeof useRooms>["rooms"] }) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.idNumber.trim()) errs.idNumber = "Required";
    if (!form.firstName.trim()) errs.firstName = "Required";
    if (!form.lastName.trim()) errs.lastName = "Required";
    if (!form.nationality.trim()) errs.nationality = "Required";
    if (!form.subcontractor.trim()) errs.subcontractor = "Required";
    if (!form.jobRole.trim()) errs.jobRole = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("saving");
    try {
      await addWorker({
        firstName: form.firstName, lastName: form.lastName, gender: form.gender,
        nationality: form.nationality, phone: form.phone, subcontractor: form.subcontractor,
        jobRole: form.jobRole, roomId: form.roomId, zoneId: form.zoneId,
        docType: form.docType, idNumber: form.idNumber,
      });
      setStatus("done");
      setTimeout(() => onClose(), 1800);
    } catch (err) {
      console.error("addWorker failed:", err);
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-gray-50 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-800">ลงทะเบียนแรงงาน</h2>
            <p className="text-xs text-gray-500">Worker Registration</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"><X className="h-5 w-5" /></button>
        </div>

        {status === "done" ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"><CheckCircle className="h-8 w-8 text-emerald-600" /></div>
            <h3 className="text-lg font-bold text-gray-800">ลงทะเบียนสำเร็จ!</h3>
            <p className="text-sm text-gray-500">กำลังปิดหน้าต่างนี้...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
            {/* Photo */}
            <div className="flex items-center gap-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden">
                {photoPreview ? <img src={photoPreview} alt="preview" className="h-full w-full object-cover" /> : <User className="h-9 w-9 text-gray-300" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">รูปถ่าย</p>
                <p className="mt-0.5 text-xs text-gray-400">JPG, PNG — แนะนำขนาด 1:1</p>
                <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
                  <Upload className="h-3.5 w-3.5" />อัปโหลดรูป
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </label>
              </div>
            </div>

            {/* Identity */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <SectionTitle n={1} title="ข้อมูลเอกสารตัวตน" sub="Identity Documents" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="ประเภทเอกสาร" required>
                  <div className="relative">
                    <select value={form.docType} onChange={(e) => set("docType", e.target.value as DocType)} className={selectCls()}>
                      {(["national-id", "passport", "work-permit"] as DocType[]).map((d) => <option key={d} value={d}>{DOC_LABELS[d]}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </Field>
                <Field label="หมายเลขเอกสาร" required error={errors.idNumber}>
                  <input value={form.idNumber} onChange={(e) => set("idNumber", e.target.value)} placeholder="เลขบัตร / หนังสือเดินทาง / ใบอนุญาต" className={inputCls(errors.idNumber)} />
                </Field>
              </div>
            </div>

            {/* Personal Info */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <SectionTitle n={2} title="ข้อมูลส่วนตัว" sub="Personal Information" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="ชื่อ" required error={errors.firstName}>
                  <input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="ชื่อ" className={inputCls(errors.firstName)} />
                </Field>
                <Field label="นามสกุล" required error={errors.lastName}>
                  <input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="นามสกุล" className={inputCls(errors.lastName)} />
                </Field>
                <Field label="เพศ">
                  <div className="relative">
                    <select value={form.gender} onChange={(e) => set("gender", e.target.value as Gender)} className={selectCls()}>
                      <option value="male">ชาย</option>
                      <option value="female">หญิง</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </Field>
                <Field label="สัญชาติ" required error={errors.nationality}>
                  <input value={form.nationality} onChange={(e) => set("nationality", e.target.value)} placeholder="เช่น ไทย, เมียนมา, กัมพูชา" className={inputCls(errors.nationality)} />
                </Field>
                <Field label="เบอร์โทรศัพท์">
                  <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="e.g. 081-234-5678" className={inputCls()} />
                </Field>
              </div>
            </div>

            {/* Employment */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <SectionTitle n={3} title="ข้อมูลการจ้างงาน" sub="Employment Information" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="ผู้รับเหมา / บริษัทส่งแรงงาน" required error={errors.subcontractor}>
                  <input value={form.subcontractor} onChange={(e) => set("subcontractor", e.target.value)} placeholder="ชื่อบริษัท/ผู้รับเหมา" className={inputCls(errors.subcontractor)} />
                </Field>
                <Field label="ตำแหน่งงาน" required error={errors.jobRole}>
                  <input value={form.jobRole} onChange={(e) => set("jobRole", e.target.value)} placeholder="เช่น General Worker, Foreman" className={inputCls(errors.jobRole)} />
                </Field>
                <Field label="วันเริ่มงาน">
                  <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputCls()} />
                </Field>
              </div>
            </div>

            {status === "error" && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span className="font-semibold">บันทึกไม่สำเร็จ:</span> {errorMsg || "เกิดข้อผิดพลาด กรุณาลองใหม่"}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50">ยกเลิก</button>
              <button type="submit" disabled={status === "saving"} className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:opacity-60">
                {status === "saving" ? <><Loader2 className="h-4 w-4 animate-spin" />กำลังบันทึก...</> : "ลงทะเบียนแรงงาน"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function WorkerDetailModal({
  worker, onClose, zones, rooms,
}: {
  worker: Worker;
  onClose: () => void;
  zones: ReturnType<typeof useZones>["zones"];
  rooms: ReturnType<typeof useRooms>["rooms"];
}) {
  type Mode = "view" | "edit" | "confirm-delete";
  const [mode, setMode] = useState<Mode>("view");
  const [form, setForm] = useState<Omit<Worker, "id">>({
    firstName: worker.firstName, lastName: worker.lastName, gender: worker.gender,
    nationality: worker.nationality, phone: worker.phone, subcontractor: worker.subcontractor,
    jobRole: worker.jobRole, roomId: worker.roomId, zoneId: worker.zoneId,
    docType: worker.docType, idNumber: worker.idNumber,
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  function setF<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "Required";
    if (!form.lastName.trim()) errs.lastName = "Required";
    if (!form.idNumber.trim()) errs.idNumber = "Required";
    if (!form.nationality.trim()) errs.nationality = "Required";
    if (!form.subcontractor.trim()) errs.subcontractor = "Required";
    if (!form.jobRole.trim()) errs.jobRole = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true); setSaveErr("");
    try {
      await updateWorker(worker.id, form);
      onClose();
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : String(e));
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteWorker(worker.id);
      onClose();
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : String(e));
      setDeleting(false);
      setMode("view");
    }
  }

  const INFO_ROW = (label: string, value: string | undefined) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5">
      <span className="w-36 shrink-0 text-xs text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value || <span className="text-gray-300">—</span>}</span>
    </div>
  );

  const zoneLabel = zones.find((z) => z.id === worker.zoneId)?.label;
  const roomInfo = rooms.find((r) => r.id === worker.roomId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {worker.firstName.charAt(0)}
            </div>
            <div>
              <p className="text-base font-bold text-gray-800">{worker.firstName} {worker.lastName}</p>
              <p className="text-xs text-gray-400">{DOC_LABELS[worker.docType as DocType] ?? worker.docType} · {worker.idNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition"><X className="h-4 w-4" /></button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {mode === "view" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">ข้อมูลเอกสาร</p>
                {INFO_ROW("ประเภทเอกสาร", DOC_LABELS[worker.docType as DocType] ?? worker.docType)}
                {INFO_ROW("หมายเลขเอกสาร", worker.idNumber)}
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">ข้อมูลส่วนตัว</p>
                {INFO_ROW("เพศ", GENDER_LABELS[worker.gender] ?? worker.gender)}
                {INFO_ROW("สัญชาติ", worker.nationality)}
                {INFO_ROW("เบอร์โทรศัพท์", worker.phone)}
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">การจ้างงาน</p>
                {INFO_ROW("ผู้รับเหมา", worker.subcontractor)}
                {INFO_ROW("ตำแหน่ง", worker.jobRole)}
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">ห้องพัก</p>
                {INFO_ROW("โซน", zoneLabel)}
                {INFO_ROW("ห้อง", roomInfo ? `${roomInfo.number} (${roomInfo.occupied}/${roomInfo.capacity})` : undefined)}
              </div>
            </div>
          )}

          {mode === "edit" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="ชื่อ" required error={errors.firstName}>
                  <input value={form.firstName} onChange={(e) => setF("firstName", e.target.value)} className={inputCls(errors.firstName)} />
                </Field>
                <Field label="นามสกุล" required error={errors.lastName}>
                  <input value={form.lastName} onChange={(e) => setF("lastName", e.target.value)} className={inputCls(errors.lastName)} />
                </Field>
                <Field label="เพศ">
                  <div className="relative">
                    <select value={form.gender} onChange={(e) => setF("gender", e.target.value)} className={selectCls()}>
                      <option value="male">ชาย</option>
                      <option value="female">หญิง</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </Field>
                <Field label="สัญชาติ" required error={errors.nationality}>
                  <input value={form.nationality} onChange={(e) => setF("nationality", e.target.value)} className={inputCls(errors.nationality)} />
                </Field>
                <Field label="เบอร์โทรศัพท์">
                  <input type="tel" value={form.phone} onChange={(e) => setF("phone", e.target.value)} className={inputCls()} />
                </Field>
                <Field label="ประเภทเอกสาร">
                  <div className="relative">
                    <select value={form.docType} onChange={(e) => setF("docType", e.target.value)} className={selectCls()}>
                      {(["national-id", "passport", "work-permit"] as DocType[]).map((d) => <option key={d} value={d}>{DOC_LABELS[d]}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </Field>
                <Field label="หมายเลขเอกสาร" required error={errors.idNumber}>
                  <input value={form.idNumber} onChange={(e) => setF("idNumber", e.target.value)} className={inputCls(errors.idNumber)} />
                </Field>
                <Field label="ผู้รับเหมา" required error={errors.subcontractor}>
                  <input value={form.subcontractor} onChange={(e) => setF("subcontractor", e.target.value)} className={inputCls(errors.subcontractor)} />
                </Field>
                <Field label="ตำแหน่งงาน" required error={errors.jobRole}>
                  <input value={form.jobRole} onChange={(e) => setF("jobRole", e.target.value)} className={inputCls(errors.jobRole)} />
                </Field>
              </div>
              {saveErr && <p className="text-xs text-red-500">{saveErr}</p>}
            </div>
          )}

          {mode === "confirm-delete" && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-800">ยืนยันการลบ?</p>
                <p className="mt-1 text-sm text-gray-500">ข้อมูลของ <span className="font-semibold text-gray-700">{worker.firstName} {worker.lastName}</span> จะถูกลบถาวร ไม่สามารถกู้คืนได้</p>
              </div>
              {saveErr && <p className="text-xs text-red-500">{saveErr}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          {mode === "view" && (
            <>
              <button onClick={() => setMode("confirm-delete")} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition">
                <Trash2 className="h-4 w-4" />ลบ
              </button>
              <div className="flex gap-2">
                <button onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">ปิด</button>
                <button onClick={() => setMode("edit")} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition">
                  <Pencil className="h-3.5 w-3.5" />แก้ไข
                </button>
              </div>
            </>
          )}
          {mode === "edit" && (
            <>
              <button onClick={() => { setMode("view"); setSaveErr(""); }} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">ยกเลิก</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}บันทึก
              </button>
            </>
          )}
          {mode === "confirm-delete" && (
            <>
              <button onClick={() => setMode("view")} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">ยกเลิก</button>
              <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-1.5 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition disabled:opacity-60">
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}ลบถาวร
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RegistrationPage() {
  const { zones } = useZones();
  const { rooms } = useRooms();
  const { workers, loading } = useWorkers();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailWorker, setDetailWorker] = useState<Worker | null>(null);

  const roomMap = useMemo(() => Object.fromEntries(rooms.map((r) => [r.id, r])), [rooms]);
  const zoneMap = useMemo(() => Object.fromEntries(zones.map((z) => [z.id, z])), [zones]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return workers.filter((w) =>
      !q ||
      w.firstName.toLowerCase().includes(q) ||
      w.lastName.toLowerCase().includes(q) ||
      w.idNumber.toLowerCase().includes(q) ||
      w.subcontractor.toLowerCase().includes(q) ||
      (roomMap[w.roomId]?.number ?? "").toLowerCase().includes(q)
    );
  }, [workers, search, roomMap]);

  return (
    <div className="flex flex-col -m-6 bg-white" style={{ minHeight: 'calc(100vh - 56px)' }}>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              ลงทะเบียนแรงงาน <span className="text-base font-normal text-gray-400">Worker Registration</span>
            </h1>
            <p className="mt-0.5 text-xs text-gray-500">รายชื่อแรงงานทั้งหมด {filtered.length} คน</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อ, ห้อง, ผู้รับเหมา..."
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-blue-400 hover:border-gray-300 bg-gray-50/50"
              />
            </div>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition active:scale-95">
              <Plus className="h-4 w-4" />เพิ่มแรงงาน
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Users className="h-12 w-12 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">{search ? "ไม่พบผลการค้นหา" : "ยังไม่มีข้อมูลแรงงาน"}</p>
              {!search && (
                <button onClick={() => setShowModal(true)} className="mt-4 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition">
                  <Plus className="h-4 w-4" />ลงทะเบียนแรงงานคนแรก
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">ชื่อ - นามสกุล</th>
                    <th className="px-4 py-3 text-left">เพศ</th>
                    <th className="px-4 py-3 text-left">สัญชาติ</th>
                    <th className="px-4 py-3 text-left">ประเภทเอกสาร</th>
                    <th className="px-4 py-3 text-left">หมายเลขเอกสาร</th>
                    <th className="px-4 py-3 text-left">ผู้รับเหมา</th>
                    <th className="px-4 py-3 text-left">ตำแหน่ง</th>
                    <th className="px-4 py-3 text-left">โซน</th>
                    <th className="px-4 py-3 text-left">ห้องพัก</th>
                    <th className="px-4 py-3 text-left">สถานะห้อง</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((w, idx) => {
                    const room = roomMap[w.roomId];
                    const zone = zoneMap[w.zoneId];
                    const isHighlight = selectedId === w.id;
                    const statusBadge: Record<string, string> = {
                      empty: "bg-emerald-100 text-emerald-700",
                      partial: "bg-yellow-100 text-yellow-700",
                      full: "bg-red-100 text-red-700",
                      maintenance: "bg-gray-100 text-gray-500",
                    };
                    const statusLabel: Record<string, string> = {
                      empty: "ว่าง", partial: "มีผู้อยู่", full: "เต็ม", maintenance: "ซ่อมบำรุ",
                    };
                    return (
                      <tr
                        key={w.id}
                        onClick={() => setSelectedId(isHighlight ? null : w.id)}
                        onDoubleClick={() => setDetailWorker(w)}
                        title="ดับเบิลคลิกเพื่อดูรายละเอียด"
                        className={`border-b border-gray-50 cursor-pointer select-none transition ${isHighlight ? "bg-blue-50" : "hover:bg-gray-50"}`}
                      >
                        <td className="px-4 py-3 text-gray-400 tabular-nums">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isHighlight ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}>
                              {w.firstName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{w.firstName} {w.lastName}</p>
                              {w.phone && <p className="text-xs text-gray-400">{w.phone}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{GENDER_LABELS[w.gender] ?? w.gender}</td>
                        <td className="px-4 py-3 text-gray-600">{w.nationality}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{DOC_LABELS[w.docType as DocType] ?? w.docType}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{w.idNumber}</td>
                        <td className="px-4 py-3 text-gray-600">{w.subcontractor}</td>
                        <td className="px-4 py-3 text-gray-600">{w.jobRole}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{zone?.label ?? <span className="text-gray-300">—</span>}</td>
                        <td className="px-4 py-3">
                          {room ? (
                            <div className="flex items-center gap-1.5">
                              <BedDouble className="h-3.5 w-3.5 text-gray-400" />
                              <span className="font-semibold text-gray-800">{room.number}</span>
                              <span className="text-xs text-gray-400">({room.occupied}/{room.capacity})</span>
                            </div>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {room ? (
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[room.status] ?? "bg-gray-100 text-gray-500"}`}>
                              {statusLabel[room.status] ?? room.status}
                            </span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Register Modal ── */}
      {showModal && (
        <RegisterModal
          onClose={() => setShowModal(false)}
          zones={zones}
          rooms={rooms}
        />
      )}

      {/* ── Worker Detail / Edit / Delete Modal ── */}
      {detailWorker && (
        <WorkerDetailModal
          worker={detailWorker}
          onClose={() => setDetailWorker(null)}
          zones={zones}
          rooms={rooms}
        />
      )}
    </div>
  );
}
