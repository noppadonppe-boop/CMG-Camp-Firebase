"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Building2 } from "lucide-react";

type CampStatus = "Active" | "Inactive" | "Maintenance";

interface Camp {
  id: number;
  name: string;
  location: string;
  capacity: number;
  status: CampStatus;
}

const initialCamps: Camp[] = [
  {
    id: 1,
    name: "Main Camp",
    location: "123 Central Road, Bangkok, 10110",
    capacity: 200,
    status: "Active",
  },
  {
    id: 2,
    name: "Rayong Camp",
    location: "45 Coastal Highway, Rayong, 21000",
    capacity: 150,
    status: "Active",
  },
  {
    id: 3,
    name: "Chonburi Camp",
    location: "88 Industrial Estate Rd, Chonburi, 20000",
    capacity: 120,
    status: "Maintenance",
  },
  {
    id: 4,
    name: "Pattaya Annex",
    location: "12 Beach Road, Pattaya, Chonburi, 20150",
    capacity: 80,
    status: "Inactive",
  },
];

const STATUS_STYLES: Record<CampStatus, string> = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-gray-100 text-gray-600",
  Maintenance: "bg-yellow-100 text-yellow-700",
};

const STATUS_THAI: Record<CampStatus, string> = {
  Active: "เปิดใช้งาน",
  Inactive: "ปิดใช้งาน",
  Maintenance: "ซ่อมบำรุง",
};

const emptyForm = { name: "", location: "", capacity: "" };

export default function CampsPage() {
  const [camps, setCamps] = useState<Camp[]>(initialCamps);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCamp, setEditingCamp] = useState<Camp | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Camp | null>(null);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});

  function openAdd() {
    setEditingCamp(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(camp: Camp) {
    setEditingCamp(camp);
    setForm({
      name: camp.name,
      location: camp.location,
      capacity: String(camp.capacity),
    });
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    if (editingCamp) {
      setCamps((prev) =>
        prev.map((c) =>
          c.id === editingCamp.id
            ? { ...c, name: form.name, location: form.location, capacity: Number(form.capacity) }
            : c
        )
      );
    } else {
      const newCamp: Camp = {
        id: Date.now(),
        name: form.name,
        location: form.location,
        capacity: Number(form.capacity),
        status: "Active",
      };
      setCamps((prev) => [...prev, newCamp]);
    }
    closeModal();
  }

  function handleDelete(camp: Camp) {
    setDeleteTarget(camp);
  }

  function confirmDelete() {
    if (deleteTarget) {
      setCamps((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการแคมป์ <span className="text-lg font-normal text-gray-400">Manage Camps</span></h1>
          <p className="mt-1 text-sm text-gray-500">
            เพิ่ม แก้ไข และจัดการข้อมูลแคมป์ทั้งหมด
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          เพิ่มแคมป์ใหม่
        </button>
      </div>

      {/* Data Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
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
            {camps.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  ยังไม่มีข้อมูลแคมป์ กดปุ่ม &quot;เพิ่มแคมป์ใหม่&quot; เพื่อเริ่มต้น
                </td>
              </tr>
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
                  <td className="px-6 py-4 text-gray-700">
                    <span className="font-semibold">{camp.capacity.toLocaleString()}</span>
                    <span className="ml-1 text-gray-400">คน</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[camp.status]}`}
                    >
                      {STATUS_THAI[camp.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(camp)}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(camp)}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="border-t border-gray-100 px-6 py-3 text-xs text-gray-400">
          แสดงทั้งหมด {camps.length} แคมป์
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-800">
                {editingCamp ? "แก้ไขแคมป์" : "เพิ่มแคมป์ใหม่"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-5 px-6 py-5">
                {/* Camp Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    ชื่อแคมป์ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="เช่น แคมป์หลัก, Rayong Camp"
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Location Address */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    ที่ตั้ง / ที่อยู่ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="เช่น 123 ถ.กลาง กรุงเทพฯ 10110"
                    rows={3}
                    className={`w-full resize-none rounded-lg border px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 ${
                      errors.location ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
                    }`}
                  />
                  {errors.location && (
                    <p className="mt-1 text-xs text-red-500">{errors.location}</p>
                  )}
                </div>

                {/* Maximum Capacity */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    ความจุสูงสุด (คน) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      value={form.capacity}
                      onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                      placeholder="e.g. 200"
                      className={`w-full rounded-lg border px-3 py-2.5 pr-16 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 ${
                        errors.capacity ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      คน
                    </span>
                  </div>
                  {errors.capacity && (
                    <p className="mt-1 text-xs text-red-500">{errors.capacity}</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {editingCamp ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มแคมป์"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">ลบแคมป์</h3>
                <p className="mt-1 text-sm text-gray-500">
                  คุณต้องการลบ{" "}
                  <span className="font-semibold text-gray-700">{deleteTarget.name}</span>{" "}
                  ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
