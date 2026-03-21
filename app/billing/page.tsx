"use client";

import Link from "next/link";
import {
  Gauge,
  Receipt,
  ArrowRight,
  Droplets,
  Zap,
  BedDouble,
  ShieldAlert,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

/* ─── Mock summary numbers ───────────────────────────────────── */

const SUMMARY = {
  totalInvoices:  7,
  paidCount:      2,
  unpaidCount:    3,
  overdueCount:   2,
  totalDue:       37626.5,
  totalCollected: 9106,
  totalPending:   28520.5,
  billingMonth:   new Date(new Date().getFullYear(), new Date().getMonth(), 1),
};

function fmtMonth(d: Date) {
  return d.toLocaleDateString("th-TH", { month: "long", year: "numeric" });
}

function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function BillingHomePage() {
  const collectionRate = Math.round((SUMMARY.paidCount / SUMMARY.totalInvoices) * 100);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          ระบบบิลค่าใช้จ่าย{" "}
          <span className="text-lg font-normal text-gray-400">Camp Billing</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          ภาพรวมการเรียกเก็บเงินประจำเดือน{" "}
          <span className="font-semibold text-blue-600">{fmtMonth(SUMMARY.billingMonth)}</span>
        </p>
      </div>

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-400">ยอดรวมทั้งหมด</span>
          </div>
          <p className="text-xl font-bold tabular-nums text-gray-800">฿{fmt(SUMMARY.totalDue)}</p>
          <p className="mt-0.5 text-xs text-gray-400">{SUMMARY.totalInvoices} ใบแจ้งหนี้</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-600">ชำระแล้ว</span>
          </div>
          <p className="text-xl font-bold tabular-nums text-emerald-700">฿{fmt(SUMMARY.totalCollected)}</p>
          <p className="mt-0.5 text-xs text-emerald-500">{SUMMARY.paidCount} ห้อง</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium text-amber-600">ค้างชำระ</span>
          </div>
          <p className="text-xl font-bold tabular-nums text-amber-700">฿{fmt(SUMMARY.totalPending)}</p>
          <p className="mt-0.5 text-xs text-amber-500">{SUMMARY.unpaidCount} ห้อง</p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium text-red-600">เกินกำหนด</span>
          </div>
          <p className="text-xl font-bold tabular-nums text-red-700">{SUMMARY.overdueCount} ห้อง</p>
          <p className="mt-0.5 text-xs text-red-500">ต้องดำเนินการ</p>
        </div>
      </div>

      {/* Collection progress */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-gray-700">อัตราการชำระเงิน</span>
          <span className="font-bold text-blue-600">{collectionRate}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-200">
          <div
            className="h-3 rounded-full bg-blue-600 transition-all duration-700"
            style={{ width: `${collectionRate}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-400">
          ชำระแล้ว {SUMMARY.paidCount} จาก {SUMMARY.totalInvoices} ห้อง
        </p>
      </div>

      {/* Navigation cards */}
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          เมนูหลัก
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Meter Readings */}
          <Link
            href="/billing/meter-readings"
            className="group flex items-start gap-4 rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-400 hover:shadow-md active:scale-[0.99]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
              <Gauge className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-gray-800 group-hover:text-blue-700">
                บันทึกค่ามิเตอร์
              </p>
              <p className="mt-0.5 text-sm text-gray-500">
                กรอกค่ามิเตอร์น้ำและไฟฟ้าประจำเดือนสำหรับทุกห้อง
              </p>
              <div className="mt-3 flex gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Droplets className="h-3.5 w-3.5 text-blue-400" />น้ำ ฿18/หน่วย</span>
                <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-amber-400" />ไฟ ฿4.50/หน่วย</span>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-gray-300 transition group-hover:text-blue-500 group-hover:translate-x-1" />
          </Link>

          {/* Invoices */}
          <Link
            href="/billing/invoices"
            className="group flex items-start gap-4 rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-400 hover:shadow-md active:scale-[0.99]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-gray-800 group-hover:text-indigo-700">
                ใบแจ้งหนี้รายเดือน
              </p>
              <p className="mt-0.5 text-sm text-gray-500">
                ดู ชำระ และพิมพ์ใบแจ้งหนี้รวมทุกรายการต่อห้อง
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="flex items-center gap-1 text-gray-400"><BedDouble className="h-3.5 w-3.5" />ค่าเช่า</span>
                <span className="flex items-center gap-1 text-gray-400"><Droplets className="h-3.5 w-3.5 text-blue-400" />น้ำ</span>
                <span className="flex items-center gap-1 text-gray-400"><Zap className="h-3.5 w-3.5 text-amber-400" />ไฟฟ้า</span>
                <span className="flex items-center gap-1 text-red-400"><ShieldAlert className="h-3.5 w-3.5" />ค่าปรับ</span>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-gray-300 transition group-hover:text-indigo-500 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
