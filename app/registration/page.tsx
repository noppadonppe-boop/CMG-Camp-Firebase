"use client";

import { useState, useRef } from "react";
import {
  Camera,
  User,
  FileText,
  Briefcase,
  BedDouble,
  QrCode,
  Upload,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { addWorker } from "@/lib/db/useWorkers";
import { useZones, useRooms } from "@/lib/db/useRooms";

/* ─── Static options ────────────────────────────────────────────── */

const SUBCONTRACTORS = [
  "Alpha Construction Co.",
  "Beta Workforce Ltd.",
  "Gamma Labour Services",
  "Delta Staffing Group",
  "Epsilon Manpower Co.",
];

const JOB_ROLES = [
  "General Worker",
  "Skilled Technician",
  "Foreman",
  "Safety Officer",
  "Site Engineer",
  "Electrician",
  "Plumber",
  "Welder",
];

/* ─── Helpers ────────────────────────────────────────────────── */

interface FormData {
  photo: File | null;
  photoPreview: string | null;
  docType: string;
  idNumber: string;
  firstName: string;
  lastName: string;
  gender: string;
  nationality: string;
  phone: string;
  subcontractor: string;
  jobRole: string;
  zone: string;
  room: string;
}

type FieldErrors = Partial<Record<keyof FormData, string>>;

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
          <Icon className="h-4 w-4 text-blue-600" />
        </div>
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Input({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 ${
        error
          ? "border-red-400 bg-red-50 focus:ring-red-400"
          : "border-gray-300 bg-white hover:border-gray-400"
      } ${props.className ?? ""}`}
    />
  );
}

function Select({
  error,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`w-full appearance-none rounded-lg border px-3 py-2.5 pr-9 text-sm text-gray-800 outline-none transition focus:ring-2 focus:ring-blue-500 ${
          error
            ? "border-red-400 bg-red-50 focus:ring-red-400"
            : "border-gray-300 bg-white hover:border-gray-400"
        } ${props.className ?? ""}`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */

export default function RegistrationPage() {
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    photo: null,
    photoPreview: null,
    docType: "",
    idNumber: "",
    firstName: "",
    lastName: "",
    gender: "",
    nationality: "",
    phone: "",
    subcontractor: "",
    jobRole: "",
    zone: "",
    room: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const { zones, loading: zonesLoading } = useZones();
  const { rooms, loading: roomsLoading } = useRooms();

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    set("photo", file);
    const url = URL.createObjectURL(file);
    set("photoPreview", url);
  }

  function handleZoneChange(zone: string) {
    set("zone", zone);
    set("room", "");
    if (errors.zone) setErrors((e) => ({ ...e, zone: undefined }));
  }

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (!form.docType) e.docType = "กรุณาเลือกประเภทเอกสาร";
    if (!form.idNumber.trim()) e.idNumber = "กรุณาระบุเลขเอกสาร";
    if (!form.firstName.trim()) e.firstName = "กรุณาระบุชื่อ";
    if (!form.lastName.trim()) e.lastName = "กรุณาระบุนามสกุล";
    if (!form.gender) e.gender = "กรุณาเลือกเพศ";
    if (!form.nationality.trim()) e.nationality = "กรุณาระบุสัญชาติ";
    if (!form.phone.trim()) e.phone = "กรุณาระบุเบอร์โทรศัพท์";
    if (!form.subcontractor) e.subcontractor = "กรุณาเลือกผู้รับเหมา";
    if (!form.jobRole) e.jobRole = "กรุณาเลือกตำแหน่ง";
    if (!form.zone) e.zone = "กรุณาเลือกโซน";
    if (!form.room) e.room = "กรุณาเลือกห้องพัก";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      document.getElementById(firstKey)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      await addWorker({
        firstName:     form.firstName,
        lastName:      form.lastName,
        gender:        form.gender,
        nationality:   form.nationality,
        phone:         form.phone,
        subcontractor: form.subcontractor,
        jobRole:       form.jobRole,
        roomId:        form.room,
        zoneId:        form.zone,
        docType:       form.docType,
        idNumber:      form.idNumber,
      });
      setSubmitted(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  }

  const availableRooms =
    form.zone
      ? rooms.filter((r) => r.zoneId === form.zone && r.status !== "full" && r.status !== "maintenance")
      : [];

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <QrCode className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">ลงทะเบียนสำเร็จแล้ว</h2>
        <p className="max-w-sm text-sm text-gray-500">
          คนงาน{" "}
          <span className="font-semibold text-gray-700">
            {form.firstName} {form.lastName}
          </span>{" "}
          ได้รับการลงทะเบียนเรียบร้อยแล้ว
        </p>
        <div className="mt-2 flex gap-3">
          <button
            onClick={() => { setForm({ photo: null, photoPreview: null, docType: "", idNumber: "", firstName: "", lastName: "", gender: "", nationality: "", phone: "", subcontractor: "", jobRole: "", zone: "", room: "" }); setSubmitted(false); }}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            ลงทะเบียนเพิ่ม
          </button>
          <button
            onClick={() => router.push("/")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            ไปหน้าแดชบอร์ด
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ลงทะเบียนคนงาน <span className="text-lg font-normal text-gray-400">Worker Registration</span></h1>
        <p className="mt-1 text-sm text-gray-500">
          กรอกข้อมูลให้ครบถ้วนเพื่อลงทะเบียนและสร้าง QR Code เข้าแคมป์
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-5 max-w-3xl">

          {/* ── 1. Identity ───────────────────────────────────── */}
          <SectionCard icon={FileText} title="เอกสารประจำตัว">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              {/* Photo Upload */}
              <div className="flex flex-col items-center gap-2">
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="flex h-28 w-28 shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition hover:border-blue-400 hover:bg-blue-50"
                >
                  {form.photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.photoPreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <>
                      <Camera className="h-7 w-7" />
                      <span className="text-center text-[10px] font-medium leading-tight px-1">
                        อัปโหลดรูป
                      </span>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  <Upload className="h-3 w-3" /> เลือกไฟล์
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              {/* Doc fields */}
              <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="ประเภทเอกสาร" required error={errors.docType}>
                  <Select
                    id="docType"
                    value={form.docType}
                    onChange={(e) => set("docType", e.target.value)}
                    error={errors.docType}
                  >
                    <option value="">เลือกประเภท…</option>
                    <option value="national-id">บัตรประชาชน</option>
                    <option value="passport">หนังสือเดินทาง</option>
                    <option value="work-permit">ใบอนุญาตทำงาน</option>
                  </Select>
                </Field>
                <Field label="เลขที่เอกสาร" required error={errors.idNumber}>
                  <Input
                    id="idNumber"
                    type="text"
                    value={form.idNumber}
                    onChange={(e) => set("idNumber", e.target.value)}
                    placeholder="e.g. 1-1234-56789-01-2"
                    error={errors.idNumber}
                  />
                </Field>
              </div>
            </div>
          </SectionCard>

          {/* ── 2. Personal Info ──────────────────────────────── */}
          <SectionCard icon={User} title="ข้อมูลส่วนตัว">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="ชื่อ" required error={errors.firstName}>
                <Input
                  id="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  placeholder="ชื่อ"
                  error={errors.firstName}
                />
              </Field>
              <Field label="นามสกุล" required error={errors.lastName}>
                <Input
                  id="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  placeholder="นามสกุล"
                  error={errors.lastName}
                />
              </Field>
              <Field label="เพศ" required error={errors.gender}>
                <Select
                  id="gender"
                  value={form.gender}
                  onChange={(e) => set("gender", e.target.value)}
                  error={errors.gender}
                >
                  <option value="">เลือกเพศ…</option>
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                  <option value="other">อื่นๆ</option>
                </Select>
              </Field>
              <Field label="สัญชาติ" required error={errors.nationality}>
                <Input
                  id="nationality"
                  type="text"
                  value={form.nationality}
                  onChange={(e) => set("nationality", e.target.value)}
                  placeholder="เช่น ไทย, พม่า, กัมพูชา"
                  error={errors.nationality}
                />
              </Field>
              <Field label="เบอร์โทรศัพท์" required error={errors.phone}>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="e.g. 081-234-5678"
                  error={errors.phone}
                  className="sm:col-span-2"
                />
              </Field>
            </div>
          </SectionCard>

          {/* ── 3. Employment ─────────────────────────────────── */}
          <SectionCard icon={Briefcase} title="ข้อมูลการจ้างงาน">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="ผู้รับเหมาช่วง" required error={errors.subcontractor}>
                <Select
                  id="subcontractor"
                  value={form.subcontractor}
                  onChange={(e) => set("subcontractor", e.target.value)}
                  error={errors.subcontractor}
                >
                  <option value="">เลือกผู้รับเหมา…</option>
                  {SUBCONTRACTORS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </Field>
              <Field label="ตำแหน่งงาน" required error={errors.jobRole}>
                <Select
                  id="jobRole"
                  value={form.jobRole}
                  onChange={(e) => set("jobRole", e.target.value)}
                  error={errors.jobRole}
                >
                  <option value="">เลือกตำแหน่ง…</option>
                  {JOB_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </SectionCard>

          {/* ── 4. Room Allocation ────────────────────────────── */}
          <SectionCard icon={BedDouble} title="จัดห้องพัก">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="โซน" required error={errors.zone}>
                <Select
                  id="zone"
                  value={form.zone}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  error={errors.zone}
                >
                  <option value="">{zonesLoading ? "โหลดโซน..." : "เลือกโซน…"}</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>{z.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="ห้องพัก" required error={errors.room}>
                <Select
                  id="room"
                  value={form.room}
                  onChange={(e) => set("room", e.target.value)}
                  error={errors.room}
                  disabled={!form.zone}
                >
                  <option value="">
                    {form.zone ? "เลือกห้องที่ว่าง…" : "เลือกโซนก่อน"}
                  </option>
                  {availableRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.number} ({r.capacity - r.occupied} เตียงว่าง)
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            {form.zone && !roomsLoading && availableRooms.length === 0 && (
              <p className="mt-3 rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                ไม่มีห้องว่างในโซนนี้ กรุณาเลือกโซนอื่น
              </p>
            )}
            {form.zone && availableRooms.length > 0 && (
              <p className="mt-3 text-xs text-gray-400">
                ว่าง {availableRooms.length} ห้อง ใน{" "}
                <span className="font-medium text-gray-600">{zones.find(z => z.id === form.zone)?.label}</span>
              </p>
            )}
          </SectionCard>

        </div>

        {/* ── Sticky Footer ─────────────────────────────────────── */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:left-60">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <p className="hidden text-xs text-gray-400 sm:block">
              ช่อง <span className="text-red-500">*</span> จำเป็นต้องกรอก
            </p>
            <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 active:bg-gray-100"
              >
                ยกเลิก
              </button>
              {saveError && <p className="text-xs text-red-500 text-right">{saveError}</p>}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                {saving ? "บันทึก..." : "บันทึก & สร้าง QR Code"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
