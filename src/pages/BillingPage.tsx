import { Link } from "react-router-dom";
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
  Loader2,
} from "lucide-react";
import { useInvoices } from "@/lib/db/useBilling";

const BILLING_MONTH = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

function fmtMonth(d: Date) {
  return d.toLocaleDateString("th-TH", { month: "long", year: "numeric" });
}

function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function BillingPage() {
  const { invoices, loading } = useInvoices();

  const totalInvoices  = invoices.length;
  const paidCount      = invoices.filter((i) => i.status === "paid").length;
  const unpaidCount    = invoices.filter((i) => i.status === "unpaid").length;
  const overdueCount   = invoices.filter((i) => i.status === "overdue").length;
  const totalDue       = invoices.filter((i) => i.status !== "void").reduce((s, i) => s + i.totalAmount, 0);
  const totalCollected = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.totalAmount, 0);
  const totalPending   = invoices.filter((i) => i.status === "unpaid" || i.status === "overdue").reduce((s, i) => s + i.totalAmount, 0);
  const collectionRate = totalInvoices > 0 ? Math.round((paidCount / totalInvoices) * 100) : 0;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        <p className="text-sm text-gray-400">กำลังโหลดข้อมูลบิล...</p>
      </div>
    );
  }

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
          <span className="font-semibold text-blue-600">{fmtMonth(BILLING_MONTH)}</span>
        </p>
      </div>

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-400">ยอดรวมทั้งหมด</span>
          </div>
          <p className="text-xl font-bold tabular-nums text-gray-800">฿{fmt(totalDue)}</p>
          <p className="mt-0.5 text-xs text-gray-400">{totalInvoices} ใบแจ้งหนี้</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-600">ชำระแล้ว</span>
          </div>
          <p className="text-xl font-bold tabular-nums text-emerald-700">฿{fmt(totalCollected)}</p>
          <p className="mt-0.5 text-xs text-emerald-500">{paidCount} ห้อง</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium text-amber-600">ค้างชำระ</span>
          </div>
          <p className="text-xl font-bold tabular-nums text-amber-700">฿{fmt(totalPending)}</p>
          <p className="mt-0.5 text-xs text-amber-500">{unpaidCount} ห้อง</p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium text-red-600">เกินกำหนด</span>
          </div>
          <p className="text-xl font-bold tabular-nums text-red-700">{overdueCount} ห้อง</p>
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
          ชำระแล้ว {paidCount} จาก {totalInvoices} ห้อง
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
            to="/billing/meter-readings"
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
            to="/billing/invoices"
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
