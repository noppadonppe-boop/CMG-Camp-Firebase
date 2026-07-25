import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Building2, Loader2, ChevronDown, MapPin } from "lucide-react";
import { useCamps, addCamp, updateCamp, deleteCamp, type Camp, type CampStatus } from "@/lib/db/useCamps";
import { useZones, addZone, updateZone, deleteZone, type Zone } from "@/lib/db/useRooms";
import { useCamp } from "@/context/CampContext";

const STATUS_STYLES: Record<CampStatus, string> = {
  Active:      "bg-green-100 text-green-700",
  Inactive:    "bg-gray-100 text-gray-600",
  Maintenance: "bg-yellow-100 text-yellow-700",
};

const STATUS_THAI: Record<CampStatus, string> = {
  Active:      "เปิดใช้งาน",
  Inactive:    "ปิดใช้งาน",
  Maintenance: "ซ่อมบำรุง",
};

const emptyForm = { name: "", location: "", capacity: "" };

export default function CampsPage() {
  const { selectedCamp } = useCamp();
  const [activeTab, setActiveTab] = useState<"camps" | "zones">("camps");
  const { camps, loading: loadingCamps } = useCamps();
  const { zones, loading: loadingZones } = useZones();
  
  // Camps State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCamp, setEditingCamp] = useState<Camp | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Camp | null>(null);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Zones State
  const [selectedCampId, setSelectedCampId] = useState<string>("");

  // Sync with global camp selection from Navbar
  useEffect(() => {
    if (selectedCamp?.id) {
      setSelectedCampId(selectedCamp.id);
    }
  }, [selectedCamp]);
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [zoneForm, setZoneForm] = useState({ label: "" });
  const [deleteZoneTarget, setDeleteZoneTarget] = useState<Zone | null>(null);
  const [zoneSaving, setZoneSaving] = useState(false);
  const [zoneError, setZoneError] = useState("");

  const loading = loadingCamps || loadingZones;

  // --- Camp Functions ---
  function openAdd() {
    setEditingCamp(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(camp: Camp) {
    setEditingCamp(camp);
    setForm({ name: camp.name, location: camp.location, capacity: String(camp.capacity) });
    setErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingCamp(null);
    setErrors({});
  }

  function validate() {
    const errs: Partial<typeof emptyForm> = {};
    if (!form.name.trim()) errs.name = "กรุณาระบุชื่อแคมป์";
    if (!form.location.trim()) errs.location = "กรุณาระบุที่อยู่/ที่ตั้ง";
    if (!form.capacity || isNaN(Number(form.capacity)) || Number(form.capacity) <= 0)
      errs.capacity = "กรุณาระบุความจุที่มากกว่า 0";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setSaveError("");
    try {
      if (editingCamp) {
        await updateCamp(editingCamp.id, { name: form.name, location: form.location, capacity: Number(form.capacity) });
      } else {
        await addCamp({ name: form.name, location: form.location, capacity: Number(form.capacity), status: "Active" });
      }
      closeModal();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (deleteTarget) {
      try { await deleteCamp(deleteTarget.id); } catch (err) { console.error("deleteCamp failed:", err); }
      setDeleteTarget(null);
    }
  }

  // --- Zone Functions ---
  async function handleZoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!zoneForm.label.trim()) { setZoneError("กรุณาระบุชื่อโซน"); return; }
    setZoneSaving(true);
    setZoneError("");
    try {
      if (editingZone) {
        await updateZone(editingZone.id, { label: zoneForm.label });
      } else {
        const campZones = zones.filter(z => z.campId === selectedCampId);
        await addZone({ label: zoneForm.label, campId: selectedCampId, order: campZones.length });
      }
      setZoneModalOpen(false);
      setEditingZone(null);
    } catch (err) {
      setZoneError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setZoneSaving(false);
    }
  }

  async function handleZoneDelete() {
    if (deleteZoneTarget) {
      try { await deleteZone(deleteZoneTarget.id); } catch (err) { console.error(err); }
      setDeleteZoneTarget(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการข้อมูลและโครงสร้าง <span className="text-lg font-normal text-gray-400">Settings</span></h1>
          <p className="mt-1 text-sm text-gray-500">จัดการข้อมูลแคมป์และโซนทั้งหมดแยกตามแคมป์</p>
        </div>
      </div>

      <div className="mb-6 flex space-x-2 rounded-xl bg-gray-100 p-1.5 w-full sm:w-80">
         <button onClick={() => setActiveTab("camps")} className={`flex-1 rounded-lg py-2.5 text-xs sm:text-sm font-semibold transition shadow-sm ${activeTab === "camps" ? "bg-white text-blue-700 shadow-md ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"}`}>
            แคมป์พักอาศัย
         </button>
         <button onClick={() => setActiveTab("zones")} className={`flex-1 rounded-lg py-2.5 text-xs sm:text-sm font-semibold transition shadow-sm ${activeTab === "zones" ? "bg-white text-indigo-700 shadow-md ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"}`}>
            โซนที่พัก
         </button>
      </div>

      {activeTab === "camps" && (
        <>
          <div className="mb-4 flex justify-end">
            <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <Plus className="h-4 w-4" />
              เพิ่มแคมป์ใหม่
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">#</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">ชื่อแคมป์</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">ที่ตั้ง</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">ความจุสูงสุด</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">สถานะ</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loadingCamps ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400"><div className="flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" />กำลังโหลด...</div></td></tr>
                ) : camps.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">ยังไม่มีข้อมูลแคมป์ กดปุ่ม "เพิ่มแคมป์ใหม่" เพื่อเริ่มต้น</td></tr>
                ) : (
                  camps.map((camp, idx) => (
                    <tr key={camp.id} className="transition hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-400">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-medium text-gray-800">
                          <Building2 className="h-4 w-4 shrink-0 text-blue-400" />
                          {camp.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{camp.location}</td>
                      <td className="px-6 py-4 text-gray-700"><span className="font-semibold">{camp.capacity.toLocaleString()}</span><span className="ml-1 text-gray-400">คน</span></td>
                      <td className="px-6 py-4"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[camp.status]}`}>{STATUS_THAI[camp.status]}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(camp)} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"><Pencil className="h-3.5 w-3.5" /> แก้ไข</button>
                          <button onClick={() => setDeleteTarget(camp)} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /> ลบ</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="border-t border-gray-100 px-6 py-3 text-xs text-gray-400">แสดงทั้งหมด {camps.length} แคมป์</div>
          </div>
        </>
      )}

      {activeTab === "zones" && (
        <>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="w-full max-w-sm">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">เลือกแคมป์ที่ต้องการจัดการโซน</label>
              <div className="relative">
                <select value={selectedCampId} onChange={e => setSelectedCampId(e.target.value)} className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm font-medium text-gray-800 outline-none hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition">
                  <option value="" disabled className="text-gray-400">-- เลือกแคมป์ --</option>
                  {camps.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
            {selectedCampId && (
              <button onClick={() => { setEditingZone(null); setZoneForm({label: ""}); setZoneModalOpen(true); }} className="flex h-[42px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
                <Plus className="h-4 w-4" /> เพิ่มโซนใหม่
              </button>
            )}
          </div>

          {selectedCampId ? (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 w-16">#</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600">ชื่อโซน</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 w-32">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {loadingZones ? (
                     <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400"><div className="flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" />กำลังโหลด...</div></td></tr>
                  ) : zones.filter(z => z.campId === selectedCampId).length === 0 ? (
                     <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400">ยังไม่มีโซนในแคมป์นี้ กด "เพิ่มโซนใหม่" เพื่อเริ่มต้น</td></tr>
                  ) : (
                    zones.filter(z => z.campId === selectedCampId).map((zone, idx) => (
                      <tr key={zone.id} className="transition hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-400">{idx + 1}</td>
                        <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-2"><MapPin className="h-4 w-4 text-indigo-400" />{zone.label}</td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                             <button onClick={() => { setEditingZone(zone); setZoneForm({label: zone.label}); setZoneModalOpen(true); }} className="p-1.5 text-indigo-600 border border-indigo-100 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition"><Pencil className="h-3.5 w-3.5" /></button>
                             <button onClick={() => setDeleteZoneTarget(zone)} className="p-1.5 text-red-600 border border-red-100 rounded-lg bg-red-50 hover:bg-red-100 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                           </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
               <div className="text-center">
                 <Building2 className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                 <p className="text-sm font-medium text-gray-500">กรุณาเลือกแคมป์ด้านบนเพื่อแสดงข้อมูลหรือจัดโซนใหม่</p>
               </div>
            </div>
          )}
        </>
      )}

      {/* Camp Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-800">{editingCamp ? "แก้ไขแคมป์" : "เพิ่มแคมป์ใหม่"}</h2>
              <button onClick={closeModal} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-5 px-6 py-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">ชื่อแคมป์ <span className="text-red-500">*</span></label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="เช่น แคมป์หลัก, Rayong Camp"
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`} />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">ที่ตั้ง / ที่อยู่ <span className="text-red-500">*</span></label>
                  <textarea value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} rows={3}
                    className={`w-full resize-none rounded-lg border px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 ${errors.location ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`} />
                  {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">ความจุสูงสุด (คน) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="e.g. 200"
                      className={`w-full rounded-lg border px-3 py-2.5 pr-16 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 ${errors.capacity ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">คน</span>
                  </div>
                  {errors.capacity && <p className="mt-1 text-xs text-red-500">{errors.capacity}</p>}
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
                <button type="button" onClick={closeModal} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50">ยกเลิก</button>
                {saveError && <p className="text-xs text-red-500">{saveError}</p>}
                <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingCamp ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มแคมป์"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Zone Add/Edit Modal */}
      {zoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setZoneModalOpen(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-800">{editingZone ? "แก้ไขโซน" : "เพิ่มโซนใหม่"}</h2>
              <button onClick={() => setZoneModalOpen(false)} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleZoneSubmit} noValidate>
               <div className="px-6 py-5">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">ชื่อโซนตึก / บล็อก <span className="text-red-500">*</span></label>
                  <input type="text" value={zoneForm.label} onChange={(e) => { setZoneForm({ label: e.target.value }); setZoneError(""); }} placeholder="เช่น Zone D, Block 4"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" />
                  {zoneError && <p className="mt-1 text-xs text-red-500">{zoneError}</p>}
               </div>
               <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
                 <button type="button" onClick={() => setZoneModalOpen(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50">ยกเลิก</button>
                 <button type="submit" disabled={zoneSaving} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60">
                   {zoneSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                   {editingZone ? "บันทึกข้อมูล" : "สร้างโซน"}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modals */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
             <h3 className="text-lg font-bold text-gray-800 mb-2">ยืนยันการลบแคมป์</h3>
             <p className="text-sm text-gray-600 mb-6">คุณยอดลบ <span className="font-semibold text-red-500">{deleteTarget.name}</span> ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
             <div className="flex justify-end gap-3 text-sm">
                <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">ยกเลิก</button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold shadow-sm">ยืนยันลบ</button>
             </div>
          </div>
        </div>
      )}

      {deleteZoneTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteZoneTarget(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
             <h3 className="text-lg font-bold text-gray-800 mb-2">ยืนยันการลบโซน</h3>
             <p className="text-sm text-gray-600 mb-6">คุณยอดลบ <span className="font-semibold text-red-500">{deleteZoneTarget.label}</span> ใช่หรือไม่?</p>
             <div className="flex justify-end gap-3 text-sm">
                <button onClick={() => setDeleteZoneTarget(null)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">ยกเลิก</button>
                <button onClick={handleZoneDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold shadow-sm">ยืนยันลบ</button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
