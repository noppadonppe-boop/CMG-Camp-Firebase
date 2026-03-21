"use client";

import Link from "next/link";
import {
  ClipboardList,
  History,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

/* ─── Mock summary numbers ───────────────────────────────────── */

const SUMMARY = {
  totalInspections: 24,
  passedCount:      18,
  warningCount:      4,
  failedCount:       2,
  month: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
};

function fmtMonth(d: Date) {
  return d.toLocaleDateString("th-TH", { month: "long", year: "numeric" });
}

export default function HygieneHomePage() {
  const passRate = Math.round((SUMMARY.passedCount / SUMMARY.totalInspections) * 100);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          ระบบตรวจสุขอนามัย{" "}
          <span className="text-lg font-normal text-gray-400">Hygiene Inspection</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          ภาพรวมการตรวจสอบความสะอาดประจำเดือน{" "}
          <span className="font-semibold text-blue-600">{fmtMonth(SUMMARY.month)}</span>
        </p>
      </div>

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-400">ตรวจทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{SUMMARY.totalInspections}</p>
          <p className="mt-0.5 text-xs text-gray-400">ห้อง/ครั้ง</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-600">ผ่าน</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{SUMMARY.passedCount}</p>
          <p className="mt-0.5 text-xs text-emerald-500">{passRate}% ของทั้งหมด</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium text-amber-600">ต้องปรับปรุง</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">{SUMMARY.warningCount}</p>
          <p className="mt-0.5 text-xs text-amber-500">warning</p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium text-red-600">ไม่ผ่าน</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{SUMMARY.failedCount}</p>
          <p className="mt-0.5 text-xs text-red-500">มีค่าปรับ</p>
        </div>
      </div>

      {/* Pass rate bar */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-gray-700">อัตราผ่านการตรวจ</span>
          <span className="font-bold text-emerald-600">{passRate}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-200">
          <div
            className="h-3 rounded-full bg-emerald-500 transition-all duration-700"
            style={{ width: `${passRate}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-400">
          ผ่าน {SUMMARY.passedCount} จาก {SUMMARY.totalInspections} ครั้ง
        </p>
      </div>

      {/* Navigation cards */}
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        เมนูหลัก
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* New Inspection */}
        <Link
          href="/hygiene/inspect"
          className="group flex items-start gap-4 rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-400 hover:shadow-md active:scale-[0.99]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
            <ClipboardList className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-gray-800 group-hover:text-blue-700">
              ฟอร์มตรวจสุขอนามัย
            </p>
            <p className="mt-0.5 text-sm text-gray-500">
              กรอกผลการตรวจสอบรายห้องตามรายการตรวจ 4 หมวด 13 รายการ
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-400">
              <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />ผ่าน / ไม่ผ่าน / N/A</span>
              <span className="flex items-center gap-1"><ShieldAlert className="h-3.5 w-3.5 text-red-400" />แนบรูปหลักฐาน</span>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-blue-500" />
        </Link>

        {/* History (placeholder) */}
        <Link
          href="/hygiene/history"
          className="group flex items-start gap-4 rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm transition hover:border-indigo-400 hover:shadow-md active:scale-[0.99]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
            <History className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-gray-800 group-hover:text-indigo-700">
              ประวัติการตรวจ
            </p>
            <p className="mt-0.5 text-sm text-gray-500">
              ดูผลการตรวจย้อนหลัง สรุปรายห้อง และรายงานค่าปรับที่เกิดขึ้น
            </p>
            <div className="mt-3 text-xs text-gray-400">
              <span>{SUMMARY.totalInspections} ครั้งในเดือนนี้</span>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-indigo-500" />
        </Link>
      </div>
    </div>
  );
}
