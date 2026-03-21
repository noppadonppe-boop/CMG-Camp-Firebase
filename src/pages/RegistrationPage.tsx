import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useZones, useRooms } from "@/lib/db/useRooms";
import { addWorker } from "@/lib/db/useWorkers";
import { User, Upload, CheckCircle, Loader2, ChevronDown } from "lucide-react";

type DocType = "national-id" | "passport" | "work-permit";
type Gender = "male" | "female";

const DOC_LABELS: Record<DocType, string> = { "national-id": "บัตรประชาชน", passport: "หนังสือเดินทาง", "work-permit": "ใบอนุญาตทำงาน" };

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

export default function RegistrationPage() {
  const navigate = useNavigate();
  const { zones } = useZones();
  const { rooms } = useRooms();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const filteredRooms = form.zoneId ? rooms.filter((r) => r.zoneId === form.zoneId && r.status !== "maintenance" && r.occupied < r.capacity) : [];

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
    if (!form.zoneId) errs.zoneId = "Required";
    if (!form.roomId) errs.roomId = "Required";
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
      setTimeout(() => navigate("/rooms"), 2000);
    } catch (err) {
      console.error("addWorker failed:", err);
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"><CheckCircle className="h-8 w-8 text-emerald-600" /></div>
        <h2 className="text-lg font-bold text-gray-800">ลงทะเบียนสำเร็จ!</h2>
        <p className="text-sm text-gray-500">กำลังนำคุณไปยังหน้าห้องพัก...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ลงทะเบียนแรงงาน <span className="text-lg font-normal text-gray-400">Worker Registration</span></h1>
        <p className="mt-1 text-sm text-gray-500">กรอกข้อมูลเพื่อลงทะเบียนแรงงานเข้าพักในแคมป์</p>
      </div>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Photo */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden">
              {photoPreview ? <img src={photoPreview} alt="preview" className="h-full w-full object-cover" /> : <User className="h-10 w-10 text-gray-300" />}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">รูปถ่าย</p>
              <p className="mt-0.5 text-xs text-gray-400">JPG, PNG — แนะนำขนาด 1:1</p>
              <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
                <Upload className="h-3.5 w-3.5" />อัปโหลดรูป
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </label>
            </div>
          </div>
        </div>

        {/* Identity */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <SectionTitle n={1} title="ข้อมูลเอกสารตัวตน" sub="Identity Documents" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <SectionTitle n={2} title="ข้อมูลส่วนตัว" sub="Personal Information" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <SectionTitle n={3} title="ข้อมูลการจ้างงาน" sub="Employment Information" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

        {/* Room Allocation */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <SectionTitle n={4} title="จัดสรรห้องพัก" sub="Room Allocation" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="โซน" required error={errors.zoneId}>
              <div className="relative">
                <select value={form.zoneId} onChange={(e) => { set("zoneId", e.target.value); set("roomId", ""); }} className={selectCls(errors.zoneId)}>
                  <option value="">-- เลือกโซน --</option>
                  {zones.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </Field>
            <Field label="ห้องพัก" required error={errors.roomId}>
              <div className="relative">
                <select value={form.roomId} onChange={(e) => set("roomId", e.target.value)} disabled={!form.zoneId} className={selectCls(errors.roomId) + " disabled:bg-gray-50 disabled:text-gray-400"}>
                  <option value="">-- เลือกห้องพัก --</option>
                  {filteredRooms.map((r) => <option key={r.id} value={r.id}>{r.number} ({r.occupied}/{r.capacity})</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </Field>
          </div>
        </div>

        {status === "error" && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="font-semibold">บันทึกไม่สำเร็จ:</span> {errorMsg || "เกิดข้อผิดพลาด กรุณาลองใหม่"}
          </div>
        )}
        <div className="flex gap-4">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 rounded-xl border border-gray-200 py-3.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50">ยกเลิก</button>
          <button type="submit" disabled={status === "saving"} onClick={() => setStatus("idle")} className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:opacity-60">
            {status === "saving" ? <><Loader2 className="h-4 w-4 animate-spin" />กำลังบันทึก...</> : "ลงทะเบียนแรงงาน"}
          </button>
        </div>
      </form>
    </div>
  );
}
