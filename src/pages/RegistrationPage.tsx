import { useState, useMemo } from "react";
import { useZones, useRooms } from "@/lib/db/useRooms";
import { addWorker, updateWorker, deleteWorker, useWorkers, type Worker } from "@/lib/db/useWorkers";
import { fetchMasterHrEmployees, type MasterHrEmployee } from "@/lib/master-hr-database";
import { saveHrEmployeesToSystem, useHrDatabase } from "@/lib/db/useHrDatabase";
import {
  User, Upload, CheckCircle, Loader2, ChevronDown, Plus, X,
  Search, BedDouble, Users, ChevronRight, Pencil, Trash2, AlertTriangle, RefreshCw, Database,
} from "lucide-react";

type DocType = "national-id" | "passport" | "work-permit";
type Gender = "male" | "female";

const DOC_LABELS: Record<DocType, string> = { "national-id": "บัตรประชาชน", passport: "หนังสือเดินทาง", "work-permit": "ใบอนุญาตทำงาน" };
const GENDER_LABELS: Record<string, string> = { male: "ชาย", female: "หญิง" };

interface FormState {
  staffId: string; masterHrId: string;
  idNumber: string; docType: DocType;
  firstName: string; lastName: string; gender: Gender; nationality: string; phone: string;
  subcontractor: string; jobRole: string; assignedSite: string; startDate: string;
  zoneId: string; roomId: string;
  // Employment types
  employmentTypes: {
    dc: boolean;
    subcontract: boolean;
    supply: boolean;
    foreign: boolean;
  };
  teamName: string;
}

const EMPTY: FormState = { staffId: "", masterHrId: "", idNumber: "", docType: "national-id", firstName: "", lastName: "", gender: "male", nationality: "ไทย", phone: "", subcontractor: "", jobRole: "", assignedSite: "", startDate: "", zoneId: "", roomId: "", employmentTypes: { dc: false, subcontract: false, supply: false, foreign: false }, teamName: "" };

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

function normalizeGender(value: string): Gender {
  const normalized = value.trim().toLocaleLowerCase("th");
  return ["female", "f", "หญิง", "ผู้หญิง"].includes(normalized) ? "female" : "male";
}

function normalizeDateInput(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (!match) return "";
  const year = Number(match[3]) > 2400 ? Number(match[3]) - 543 : Number(match[3]);
  return `${year}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

function validMasterText(value: string): string {
  const trimmed = value.trim();
  return trimmed === "-" || trimmed === "—" ? "" : trimmed;
}

function masterEmployeeDisplayName(employee: MasterHrEmployee): string {
  const structuredName = [validMasterText(employee.firstName), validMasterText(employee.lastName)]
    .filter(Boolean)
    .join(" ");

  return structuredName
    || validMasterText(employee.otherName)
    || validMasterText(employee.title)
    || employee.staffId
    || "ไม่ระบุชื่อ";
}

function EmployeeLookup({
  value, employees, loading, loadError, disabled, onRequestEmployees, onChange, onSelect,
}: {
  value: string;
  employees: MasterHrEmployee[];
  loading: boolean;
  loadError: string;
  disabled?: boolean;
  onRequestEmployees: () => Promise<void>;
  onChange: (value: string) => void;
  onSelect: (employee: MasterHrEmployee) => void;
}) {
  const [open, setOpen] = useState(false);
  const query = value.trim().toLocaleLowerCase("th");
  const matches = useMemo(() => employees.filter((employee) =>
    !query || [employee.staffId, employee.title, employee.firstName, employee.otherName, employee.lastName, employee.idNumber]
      .some((field) => field.toLocaleLowerCase("th").includes(query)),
  ).slice(0, 20), [employees, query]);

  function openDropdown() {
    if (disabled) return;
    setOpen(true);
    if (employees.length === 0 && !loading) void onRequestEmployees();
  }

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        value={value}
        disabled={disabled}
        onFocus={openDropdown}
        onClick={openDropdown}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(event) => { onChange(event.target.value); setOpen(true); }}
        placeholder="พิมพ์รหัส ชื่อ หรือนามสกุล..."
        autoComplete="off"
        className={`${disabled ? "cursor-not-allowed bg-gray-50 opacity-70" : "bg-white"} w-full rounded-xl border border-gray-300 py-3 pl-10 pr-10 text-sm outline-none transition hover:border-gray-400 focus:ring-2 focus:ring-blue-500`}
      />
      {loading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-blue-500" />}
      {!loading && <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />}
      {open && !disabled && (
        <div className="absolute z-30 mt-1 max-h-[420px] w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
          {loadError ? (
            <div className="px-4 py-3 text-xs text-red-600">โหลด HR DATABASE ไม่สำเร็จ: {loadError}</div>
          ) : loading && employees.length === 0 ? (
            <div className="px-4 py-3 text-xs text-gray-500">กำลังโหลด HR DATABASE...</div>
          ) : matches.length === 0 ? (
            <div className="px-4 py-3 text-xs text-gray-500">ไม่พบพนักงานที่ตรงกับคำค้นหา</div>
          ) : matches.map((employee) => (
            <button
              key={employee.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => { onSelect(employee); setOpen(false); }}
              className="flex w-full items-center justify-between gap-3 border-b border-gray-50 px-3 py-1.5 text-left transition last:border-b-0 hover:bg-blue-50"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold leading-4 text-gray-800">{masterEmployeeDisplayName(employee)}</p>
                <p className="truncate text-[10px] leading-3.5 text-gray-400">{employee.jobRole || employee.department || "ไม่ระบุตำแหน่ง"}</p>
              </div>
              <span className="shrink-0 font-mono text-[10px] font-semibold text-blue-700">{employee.staffId || "—"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RegisterModal({ onClose, zones, rooms, hrEmployees, hrLoading, hrLoadError, onRequestHrEmployees }: {
  onClose: () => void;
  zones: ReturnType<typeof useZones>["zones"];
  rooms: ReturnType<typeof useRooms>["rooms"];
  hrEmployees: MasterHrEmployee[];
  hrLoading: boolean;
  hrLoadError: string;
  onRequestHrEmployees: () => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function selectMasterEmployee(employee: MasterHrEmployee) {
    setForm((current) => ({
      ...current,
      staffId: employee.staffId,
      masterHrId: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      gender: normalizeGender(employee.sex),
      nationality: employee.nationality,
      phone: employee.phone,
      jobRole: employee.jobRole,
      assignedSite: employee.assignedSite || "",
      startDate: normalizeDateInput(employee.startDate),
      docType: employee.idNumber ? "national-id" : current.docType,
      idNumber: employee.idNumber,
    }));
    setErrors({});
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
        staffId: form.staffId, masterHrId: form.masterHrId,
        firstName: form.firstName, lastName: form.lastName, gender: form.gender,
        nationality: form.nationality, phone: form.phone, subcontractor: form.subcontractor,
        jobRole: form.jobRole, assignedSite: form.assignedSite, roomId: form.roomId, zoneId: form.zoneId,
        docType: form.docType, idNumber: form.idNumber,
        employmentTypes: form.employmentTypes,
        teamName: form.teamName,
        startDate: form.startDate,
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
                <div className="sm:col-span-2">
                  <Field label="รหัสพนักงาน">
                    <EmployeeLookup
                      value={form.staffId}
                      employees={hrEmployees}
                      loading={hrLoading}
                      loadError={hrLoadError}
                      onRequestEmployees={onRequestHrEmployees}
                      onChange={(value) => { set("staffId", value); set("masterHrId", ""); }}
                      onSelect={selectMasterEmployee}
                    />
                  </Field>
                  <p className="mt-1 text-xs text-gray-400">ค้นหาและเลือกจาก HR DATABASE เพื่อเติมข้อมูลพนักงานอัตโนมัติ</p>
                </div>
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
              
              {/* 1. ประเภทการจ้างงาน - Employment Type Checkboxes */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">ประเภทการจ้างงาน</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.employmentTypes.dc}
                      onChange={(e) => set("employmentTypes", { ...form.employmentTypes, dc: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">DC</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.employmentTypes.subcontract}
                      onChange={(e) => set("employmentTypes", { ...form.employmentTypes, subcontract: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Subcontract</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.employmentTypes.supply}
                      onChange={(e) => set("employmentTypes", { ...form.employmentTypes, supply: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Supply</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.employmentTypes.foreign}
                      onChange={(e) => set("employmentTypes", { ...form.employmentTypes, foreign: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">ต่างชาติ</span>
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* 2. ชื่อชุด */}
                <Field label="ชื่อชุด">
                  <input value={form.teamName} onChange={(e) => set("teamName", e.target.value)} placeholder="เช่น ชุดที่ 1, Team A" className={inputCls()} />
                </Field>
                
                {/* 3. ตำแหน่งงาน */}
                <Field label="ตำแหน่งงาน" required error={errors.jobRole}>
                  <input value={form.jobRole} onChange={(e) => set("jobRole", e.target.value)} placeholder="เช่น General Worker, Foreman" className={inputCls(errors.jobRole)} />
                </Field>
                
                {/* 4. ผู้รับเหมา / บริษัทส่งแรงงาน */}
                <Field label="ผู้รับเหมา / บริษัทส่งแรงงาน" required error={errors.subcontractor}>
                  <input value={form.subcontractor} onChange={(e) => set("subcontractor", e.target.value)} placeholder="ชื่อบริษัท/ผู้รับเหมา" className={inputCls(errors.subcontractor)} />
                </Field>
                
                {/* 5. วันเริ่มงาน */}
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
  worker, onClose, zones, rooms, hrEmployees, hrLoading, hrLoadError, onRequestHrEmployees,
}: {
  worker: Worker;
  onClose: () => void;
  zones: ReturnType<typeof useZones>["zones"];
  rooms: ReturnType<typeof useRooms>["rooms"];
  hrEmployees: MasterHrEmployee[];
  hrLoading: boolean;
  hrLoadError: string;
  onRequestHrEmployees: () => Promise<void>;
}) {
  type Mode = "view" | "edit" | "confirm-delete";
  const [mode, setMode] = useState<Mode>("view");
  const [form, setForm] = useState<Omit<Worker, "id">>({
    staffId: worker.staffId || "", masterHrId: worker.masterHrId || "",
    firstName: worker.firstName, lastName: worker.lastName, gender: worker.gender,
    nationality: worker.nationality, phone: worker.phone, subcontractor: worker.subcontractor,
    jobRole: worker.jobRole, assignedSite: worker.assignedSite || "", roomId: worker.roomId, zoneId: worker.zoneId,
    docType: worker.docType, idNumber: worker.idNumber,
    employmentTypes: worker.employmentTypes || { dc: false, subcontract: false, supply: false, foreign: false },
    teamName: worker.teamName || "",
    startDate: worker.startDate || "",
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  function setF<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function selectMasterEmployee(employee: MasterHrEmployee) {
    setForm((current) => ({
      ...current,
      staffId: employee.staffId,
      masterHrId: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      gender: normalizeGender(employee.sex),
      nationality: employee.nationality,
      phone: employee.phone,
      jobRole: employee.jobRole,
      assignedSite: employee.assignedSite || "",
      startDate: normalizeDateInput(employee.startDate),
      docType: employee.idNumber ? "national-id" : current.docType,
      idNumber: employee.idNumber,
    }));
    setErrors({});
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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-gray-50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {mode === "view" ? "ข้อมูลแรงงาน" : mode === "edit" ? "แก้ไขข้อมูลแรงงาน" : "ยืนยันการลบ"}
            </h2>
            <p className="text-xs text-gray-500">
              {mode === "view" ? "Worker Information" : mode === "edit" ? "Edit Worker" : "Confirm Delete"}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        {mode === "confirm-delete" ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">ยืนยันการลบ?</h3>
            <p className="text-sm text-gray-500 text-center px-6">
              ข้อมูลของ <span className="font-semibold text-gray-700">{worker.firstName} {worker.lastName}</span> จะถูกลบถาวร ไม่สามารถกู้คืนได้
            </p>
            {saveErr && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mx-6">
                <span className="font-semibold">ลบไม่สำเร็จ:</span> {saveErr}
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 space-y-5">
          {mode === "view" && (
            <div className="space-y-5">
              {/* Identity Section - Read Only */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <SectionTitle n={1} title="ข้อมูลเอกสารตัวตน" sub="Identity Documents" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field label="รหัสพนักงาน">
                      <EmployeeLookup
                        value={form.staffId || ""}
                        employees={hrEmployees}
                        loading={hrLoading}
                        loadError={hrLoadError}
                        disabled
                        onRequestEmployees={onRequestHrEmployees}
                        onChange={() => undefined}
                        onSelect={() => undefined}
                      />
                    </Field>
                  </div>
                  <Field label="ประเภทเอกสาร" required>
                    <div className="relative">
                      <select value={form.docType} disabled className="w-full appearance-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 pr-10 text-sm outline-none cursor-not-allowed opacity-70">
                        {(["national-id", "passport", "work-permit"] as DocType[]).map((d) => (
                          <option key={d} value={d}>{DOC_LABELS[d]}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                  </Field>
                  <Field label="หมายเลขเอกสาร" required>
                    <input value={form.idNumber} disabled className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none cursor-not-allowed opacity-70" />
                  </Field>
                </div>
              </div>

              {/* Personal Info Section - Read Only */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <SectionTitle n={2} title="ข้อมูลส่วนตัว" sub="Personal Information" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="ชื่อ" required>
                    <input value={form.firstName} disabled className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none cursor-not-allowed opacity-70" />
                  </Field>
                  <Field label="นามสกุล" required>
                    <input value={form.lastName} disabled className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none cursor-not-allowed opacity-70" />
                  </Field>
                  <Field label="เพศ">
                    <div className="relative">
                      <select value={form.gender} disabled className="w-full appearance-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 pr-10 text-sm outline-none cursor-not-allowed opacity-70">
                        <option value="male">ชาย</option>
                        <option value="female">หญิง</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                  </Field>
                  <Field label="สัญชาติ" required>
                    <input value={form.nationality} disabled className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none cursor-not-allowed opacity-70" />
                  </Field>
                  <Field label="เบอร์โทรศัพท์">
                    <input type="tel" value={form.phone} disabled className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none cursor-not-allowed opacity-70" />
                  </Field>
                </div>
              </div>

              {/* Employment Section - Read Only */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <SectionTitle n={3} title="ข้อมูลการจ้างงาน" sub="Employment Information" />
                
                {/* 1. ประเภทการจ้างงาน - Employment Type Checkboxes - Read Only */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">ประเภทการจ้างงาน</label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <label className="flex items-center gap-2 cursor-not-allowed opacity-70">
                      <input type="checkbox" checked={form.employmentTypes?.dc || false} disabled className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                      <span className="text-sm text-gray-700">DC</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-not-allowed opacity-70">
                      <input type="checkbox" checked={form.employmentTypes?.subcontract || false} disabled className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                      <span className="text-sm text-gray-700">Subcontract</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-not-allowed opacity-70">
                      <input type="checkbox" checked={form.employmentTypes?.supply || false} disabled className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                      <span className="text-sm text-gray-700">Supply</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-not-allowed opacity-70">
                      <input type="checkbox" checked={form.employmentTypes?.foreign || false} disabled className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                      <span className="text-sm text-gray-700">ต่างชาติ</span>
                    </label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* 2. ชื่อชุด */}
                  <Field label="ชื่อชุด">
                    <input value={form.teamName || ""} disabled className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none cursor-not-allowed opacity-70" />
                  </Field>
                  
                  {/* 3. ตำแหน่งงาน */}
                  <Field label="ตำแหน่งงาน" required>
                    <input value={form.jobRole} disabled className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none cursor-not-allowed opacity-70" />
                  </Field>
                  
                  {/* 4. ผู้รับเหมา / บริษัทส่งแรงงาน */}
                  <Field label="ผู้รับเหมา / บริษัทส่งแรงงาน" required>
                    <input value={form.subcontractor} disabled className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none cursor-not-allowed opacity-70" />
                  </Field>
                  
                  {/* 5. วันเริ่มงาน */}
                  <Field label="วันเริ่มงาน">
                    <input type="date" value={form.startDate || ""} disabled className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none cursor-not-allowed opacity-70" />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {mode === "edit" && (
            <div className="space-y-5">
              {/* Identity Section - Editable */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <SectionTitle n={1} title="ข้อมูลเอกสารตัวตน" sub="Identity Documents" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field label="รหัสพนักงาน">
                      <EmployeeLookup
                        value={form.staffId || ""}
                        employees={hrEmployees}
                        loading={hrLoading}
                        loadError={hrLoadError}
                        onRequestEmployees={onRequestHrEmployees}
                        onChange={(value) => { setF("staffId", value); setF("masterHrId", ""); }}
                        onSelect={selectMasterEmployee}
                      />
                    </Field>
                    <p className="mt-1 text-xs text-gray-400">เมื่อเลือกพนักงาน ข้อมูลในฟอร์มจะเปลี่ยนเป็นข้อมูลจาก Master Database</p>
                  </div>
                  <Field label="ประเภทเอกสาร" required>
                    <div className="relative">
                      <select value={form.docType} onChange={(e) => setF("docType", e.target.value)} className={selectCls()}>
                        {(["national-id", "passport", "work-permit"] as DocType[]).map((d) => (
                          <option key={d} value={d}>{DOC_LABELS[d]}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                  </Field>
                  <Field label="หมายเลขเอกสาร" required error={errors.idNumber}>
                    <input value={form.idNumber} onChange={(e) => setF("idNumber", e.target.value)} placeholder="เลขบัตร / หนังสือเดินทาง / ใบอนุญาต" className={inputCls(errors.idNumber)} />
                  </Field>
                </div>
              </div>

              {/* Personal Info Section - Editable */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <SectionTitle n={2} title="ข้อมูลส่วนตัว" sub="Personal Information" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="ชื่อ" required error={errors.firstName}>
                    <input value={form.firstName} onChange={(e) => setF("firstName", e.target.value)} placeholder="ชื่อ" className={inputCls(errors.firstName)} />
                  </Field>
                  <Field label="นามสกุล" required error={errors.lastName}>
                    <input value={form.lastName} onChange={(e) => setF("lastName", e.target.value)} placeholder="นามสกุล" className={inputCls(errors.lastName)} />
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
                    <input value={form.nationality} onChange={(e) => setF("nationality", e.target.value)} placeholder="เช่น ไทย, เมียนมา, กัมพูชา" className={inputCls(errors.nationality)} />
                  </Field>
                  <Field label="เบอร์โทรศัพท์">
                    <input type="tel" value={form.phone} onChange={(e) => setF("phone", e.target.value)} placeholder="e.g. 081-234-5678" className={inputCls()} />
                  </Field>
                </div>
              </div>

              {/* Employment Section - Editable */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <SectionTitle n={3} title="ข้อมูลการจ้างงาน" sub="Employment Information" />
                
                {/* 1. ประเภทการจ้างงาน - Employment Type Checkboxes - Editable */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">ประเภทการจ้างงาน</label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.employmentTypes?.dc || false}
                        onChange={(e) => setF("employmentTypes", { ...(form.employmentTypes || {}), dc: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">DC</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.employmentTypes?.subcontract || false}
                        onChange={(e) => setF("employmentTypes", { ...(form.employmentTypes || {}), subcontract: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Subcontract</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.employmentTypes?.supply || false}
                        onChange={(e) => setF("employmentTypes", { ...(form.employmentTypes || {}), supply: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Supply</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.employmentTypes?.foreign || false}
                        onChange={(e) => setF("employmentTypes", { ...(form.employmentTypes || {}), foreign: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">ต่างชาติ</span>
                    </label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* 2. ชื่อชุด */}
                  <Field label="ชื่อชุด">
                    <input value={form.teamName || ""} onChange={(e) => setF("teamName", e.target.value)} placeholder="เช่น ชุดที่ 1, Team A" className={inputCls()} />
                  </Field>
                  
                  {/* 3. ตำแหน่งงาน */}
                  <Field label="ตำแหน่งงาน" required error={errors.jobRole}>
                    <input value={form.jobRole} onChange={(e) => setF("jobRole", e.target.value)} placeholder="เช่น General Worker, Foreman" className={inputCls(errors.jobRole)} />
                  </Field>
                  
                  {/* 4. ผู้รับเหมา / บริษัทส่งแรงงาน */}
                  <Field label="ผู้รับเหมา / บริษัทส่งแรงงาน" required error={errors.subcontractor}>
                    <input value={form.subcontractor} onChange={(e) => setF("subcontractor", e.target.value)} placeholder="ชื่อบริษัท/ผู้รับเหมา" className={inputCls(errors.subcontractor)} />
                  </Field>
                  
                  {/* 5. วันเริ่มงาน */}
                  <Field label="วันเริ่มงาน">
                    <input type="date" value={form.startDate || ""} onChange={(e) => setF("startDate", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
              </div>

              {saveErr && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <span className="font-semibold">บันทึกไม่สำเร็จ:</span> {saveErr || "เกิดข้อผิดพลาด กรุณาลองใหม่"}
                </div>
              )}
            </div>
          )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4 rounded-b-2xl">
          {mode === "view" && (
            <>
              <button 
                onClick={() => setMode("confirm-delete")} 
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
              >
                <Trash2 className="h-4 w-4" />ลบ
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={onClose} 
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  ปิด
                </button>
                <button 
                  onClick={() => setMode("edit")} 
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  <Pencil className="h-3.5 w-3.5" />แก้ไข
                </button>
              </div>
            </>
          )}
          {mode === "edit" && (
            <>
              <button 
                onClick={() => { setMode("view"); setSaveErr(""); }} 
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleSave} 
                disabled={saving} 
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}บันทึก
              </button>
            </>
          )}
          {mode === "confirm-delete" && (
            <>
              <button 
                onClick={() => setMode("view")} 
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleDelete} 
                disabled={deleting} 
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition disabled:opacity-60"
              >
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
  const { employees: hrEmployees, loading: hrDatabaseLoading } = useHrDatabase();
  const [activeTab, setActiveTab] = useState<"worker-registration" | "hr-database">("worker-registration");
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailWorker, setDetailWorker] = useState<Worker | null>(null);
  const [hrSearch, setHrSearch] = useState("");
  const [hrSyncing, setHrSyncing] = useState(false);
  const [hrSyncError, setHrSyncError] = useState("");
  const [hrLastSyncedAt, setHrLastSyncedAt] = useState<Date | null>(null);

  const roomMap = useMemo(() => Object.fromEntries(rooms.map((r) => [r.id, r])), [rooms]);
  const zoneMap = useMemo(() => Object.fromEntries(zones.map((z) => [z.id, z])), [zones]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return workers.filter((w) =>
      !q ||
      w.firstName.toLowerCase().includes(q) ||
      w.lastName.toLowerCase().includes(q) ||
      (w.staffId || "").toLowerCase().includes(q) ||
      w.idNumber.toLowerCase().includes(q) ||
      w.subcontractor.toLowerCase().includes(q) ||
      (roomMap[w.roomId]?.number ?? "").toLowerCase().includes(q)
    );
  }, [workers, search, roomMap]);

  const filteredHrEmployees = useMemo(() => {
    const q = hrSearch.trim().toLocaleLowerCase("th");
    if (!q) return hrEmployees;

    return hrEmployees.filter((employee) =>
      [
        employee.staffId,
        employee.title,
        employee.firstName,
        employee.otherName,
        employee.lastName,
        employee.idNumber,
        employee.taxId,
        employee.phone,
        employee.department,
        employee.jobRole,
        employee.assignedSite,
        employee.employeeType,
        employee.employeeStatus,
        employee.nationality,
      ].some((value) => value.toLocaleLowerCase("th").includes(q)),
    );
  }, [hrEmployees, hrSearch]);

  async function handleSyncHrDatabase() {
    if (hrSyncing) return;
    setHrSyncing(true);
    setHrSyncError("");

    try {
      const employees = await fetchMasterHrEmployees();
      await saveHrEmployeesToSystem(employees);
      setHrLastSyncedAt(new Date());
    } catch (error) {
      console.error("Master HR Database sync failed:", error);
      setHrSyncError(error instanceof Error ? error.message : String(error));
    } finally {
      setHrSyncing(false);
    }
  }

  return (
    <div className="flex flex-col -m-6 bg-white" style={{ minHeight: 'calc(100vh - 56px)' }}>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              ลงทะเบียนแรงงาน <span className="text-base font-normal text-gray-400">Worker Registration</span>
            </h1>
            {activeTab === "worker-registration" && (
              <p className="mt-0.5 text-xs text-gray-500">รายชื่อแรงงานทั้งหมด {filtered.length} คน</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-gray-200 bg-white px-6">
          <button
            type="button"
            onClick={() => setActiveTab("worker-registration")}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${activeTab === "worker-registration" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}
          >
            Worker Registration
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("hr-database")}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${activeTab === "hr-database" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}
          >
            HR DATABASE
          </button>
        </div>

        {activeTab === "worker-registration" && (
          <>
            <div className="flex items-center justify-end gap-4 border-b border-gray-100 bg-white px-6 py-3">
              <div className="relative w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหารหัส, ชื่อ, ห้อง, ผู้รับเหมา..."
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-blue-400 hover:border-gray-300 bg-gray-50/50"
                />
              </div>
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition active:scale-95">
                <Plus className="h-4 w-4" />เพิ่มแรงงาน
              </button>
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
                        <th className="px-4 py-3 text-left">รหัสพนักงาน</th>
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
                            <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">{w.staffId || <span className="text-gray-300">—</span>}</td>
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
          </>
        )}

        {activeTab === "hr-database" && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-white px-6 py-3">
              <div>
                <p className="text-sm font-semibold text-gray-700">Master HR Database</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {hrLastSyncedAt
                    ? `Sync ล่าสุด ${hrLastSyncedAt.toLocaleString("th-TH")} · ${hrEmployees.length} รายการ`
                    : hrEmployees.length > 0
                      ? `ข้อมูลที่บันทึกอยู่ในระบบ ${hrEmployees.length} รายการ · Master จะถูกอ่านเมื่อกด Sync เท่านั้น`
                      : "ข้อมูลจะถูกดึงและบันทึกเมื่อกด Sync Database เท่านั้น"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={hrSearch}
                    onChange={(event) => setHrSearch(event.target.value)}
                    placeholder="ค้นหาข้อมูลพนักงาน..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-9 pr-3 text-sm outline-none transition hover:border-gray-300 focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSyncHrDatabase}
                  disabled={hrSyncing}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {hrSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  {hrSyncing ? "กำลัง Sync..." : "Sync Database"}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {hrSyncError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <span className="font-semibold">Sync ไม่สำเร็จ:</span> {hrSyncError}
                </div>
              )}

              {(hrDatabaseLoading || hrSyncing) && hrEmployees.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-20 text-sm text-gray-400">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  {hrSyncing ? "กำลังอ่านและบันทึกข้อมูลจาก Master Database..." : "กำลังโหลดข้อมูลที่บันทึกไว้ในระบบ..."}
                </div>
              ) : hrEmployees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Database className="mb-3 h-12 w-12 text-gray-200" />
                  <p className="text-sm font-medium text-gray-500">ยังไม่มีข้อมูลจาก Master Database</p>
                  <p className="mt-1 text-xs text-gray-400">กด Sync Database เพื่ออ่าน Master แบบ Read Only และบันทึกลงระบบ</p>
                </div>
              ) : filteredHrEmployees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Search className="mb-3 h-10 w-10 text-gray-200" />
                  <p className="text-sm text-gray-400">ไม่พบผลการค้นหา</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-[1500px] w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500">
                          <th className="whitespace-nowrap px-4 py-3 text-left">#</th>
                          <th className="whitespace-nowrap px-4 py-3 text-left">รหัสพนักงาน</th>
                          <th className="whitespace-nowrap px-4 py-3 text-left">ชื่อภาษาอื่น</th>
                          <th className="whitespace-nowrap px-4 py-3 text-left">ชื่อสกุล</th>
                          <th className="whitespace-nowrap px-4 py-3 text-left">เพศ</th>
                          <th className="whitespace-nowrap px-4 py-3 text-left">ตำแหน่ง</th>
                          <th className="whitespace-nowrap px-4 py-3 text-left">สถานที่ปฏิบัติงาน</th>
                          <th className="whitespace-nowrap px-4 py-3 text-left">วันเริ่มงาน</th>
                          <th className="whitespace-nowrap px-4 py-3 text-left">สถานะพนักงาน</th>
                          <th className="whitespace-nowrap px-4 py-3 text-left">สัญชาติ</th>
                          <th className="whitespace-nowrap px-4 py-3 text-left">เลขบัตรประชาชน</th>
                          <th className="whitespace-nowrap px-4 py-3 text-left">เลขผู้เสียภาษี</th>
                          <th className="whitespace-nowrap px-4 py-3 text-left">โทรศัพท์</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHrEmployees.map((employee, index) => (
                          <tr key={`${employee.id}-${index}`} className="border-b border-gray-50 transition hover:bg-blue-50/40">
                            <td className="px-4 py-3 text-gray-400 tabular-nums">{index + 1}</td>
                            <td className="whitespace-nowrap px-4 py-3 font-semibold text-blue-700">{employee.staffId || "—"}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-gray-600">{employee.otherName || "—"}</td>
                            <td className="whitespace-nowrap px-4 py-3 font-semibold text-gray-800">{employee.lastName || "—"}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-gray-600">{employee.sex || "—"}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-gray-600">{employee.jobRole || "—"}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-gray-600">{employee.assignedSite || "—"}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-gray-600">{employee.startDate || "—"}</td>
                            <td className="whitespace-nowrap px-4 py-3">
                              <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                {employee.employeeStatus || "—"}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-gray-600">{employee.nationality || "—"}</td>
                            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-500">{employee.idNumber || "—"}</td>
                            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-500">{employee.taxId || "—"}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-gray-600">{employee.phone || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        </div>

      {/* ── Register Modal ── */}
      {showModal && (
        <RegisterModal
          onClose={() => setShowModal(false)}
          zones={zones}
          rooms={rooms}
          hrEmployees={hrEmployees}
          hrLoading={hrDatabaseLoading || hrSyncing}
          hrLoadError={hrSyncError}
          onRequestHrEmployees={handleSyncHrDatabase}
        />
      )}

      {/* ── Worker Detail / Edit / Delete Modal ── */}
      {detailWorker && (
        <WorkerDetailModal
          worker={detailWorker}
          onClose={() => setDetailWorker(null)}
          zones={zones}
          rooms={rooms}
          hrEmployees={hrEmployees}
          hrLoading={hrDatabaseLoading || hrSyncing}
          hrLoadError={hrSyncError}
          onRequestHrEmployees={handleSyncHrDatabase}
        />
      )}
    </div>
  );
}
