import { useState, useMemo } from "react";
import {
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  Ban,
  ChevronDown,
  Search,
  Building2,
  SlidersHorizontal,
  Eye,
  Printer,
  X,
  Droplets,
  Zap,
  BedDouble,
  ShieldAlert,
  CreditCard,
  TrendingUp,
  FileText,
  Loader2,
} from "lucide-react";
import { Timestamp } from "firebase/firestore";
import {
  useInvoices,
  updateInvoiceStatus,
  type Invoice,
  type PaymentStatus,
} from "@/lib/db/useBilling";

const BILLING_MONTH = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
const DUE_DATE      = new Date(BILLING_MONTH.getFullYear(), BILLING_MONTH.getMonth(), 25);

function tsToDate(v: Timestamp | Date | undefined): Date {
  if (!v) return new Date();
  if (v instanceof Timestamp) return v.toDate();
  return v;
}

/* ─── Config ─────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<PaymentStatus, {
  label: string; labelEn: string;
  bg: string; text: string; border: string; icon: React.ElementType;
}> = {
  unpaid:  { label: "ยังไม่ชำระ", labelEn: "Unpaid",  bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200", icon: Clock        },
  paid:    { label: "ชำระแล้ว",   labelEn: "Paid",    bg: "bg-emerald-50",text: "text-emerald-700",border: "border-emerald-200",icon: CheckCircle2 },
  overdue: { label: "เกินกำหนด",  labelEn: "Overdue", bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",   icon: AlertCircle  },
  void:    { label: "ยกเลิก",     labelEn: "Void",    bg: "bg-gray-100",  text: "text-gray-500",   border: "border-gray-200",  icon: Ban          },
};

const LINE_ICON: Record<string, React.ElementType> = {
  rent: BedDouble, water: Droplets, electricity: Zap, penalty: ShieldAlert,
};

/* ─── Helpers ────────────────────────────────────────────────── */

function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtMonth(d: Date) {
  return d.toLocaleDateString("th-TH", { month: "long", year: "numeric" });
}
function fmtDate(d: Date) {
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}

/* ─── Invoice Receipt Modal ──────────────────────────────────── */

function InvoiceModal({ invoice, onClose, onMarkPaid }: {
  invoice: Invoice;
  onClose: () => void;
  onMarkPaid: (id: string) => void;
}) {
  const cfg = STATUS_CONFIG[invoice.status];
  const StatusIcon = cfg.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-800">ใบแจ้งหนี้</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[75vh] px-6 py-5">
          <div className="mb-4 rounded-xl bg-gray-50 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-gray-400">เลขที่ใบแจ้งหนี้</p>
                <p className="text-sm font-bold text-gray-800">{invoice.invoiceNumber}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {cfg.label}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-y-2 text-xs">
              <div>
                <span className="text-gray-400">ห้อง</span>
                <p className="font-semibold text-gray-700">{invoice.roomNumber} · {invoice.zone}</p>
              </div>
              <div>
                <span className="text-gray-400">ผู้รับเหมา</span>
                <p className="font-semibold text-gray-700 truncate">{invoice.subcontractor}</p>
              </div>
              <div>
                <span className="text-gray-400">ประจำเดือน</span>
                <p className="font-semibold text-gray-700">{fmtMonth(tsToDate(invoice.billingMonth))}</p>
              </div>
              <div>
                <span className="text-gray-400">ครบกำหนด</span>
                <p className={`font-semibold ${invoice.status === "overdue" ? "text-red-600" : "text-gray-700"}`}>
                  {fmtDate(tsToDate(invoice.dueDate))}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              รายการค่าใช้จ่าย
            </p>
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
              {invoice.lineItems.map((item, i) => {
                const LIcon = LINE_ICON[item.type] ?? FileText;
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      item.type === "water" ? "bg-blue-100" :
                      item.type === "electricity" ? "bg-amber-100" :
                      item.type === "penalty" ? "bg-red-100" : "bg-gray-100"
                    }`}>
                      <LIcon className={`h-3.5 w-3.5 ${
                        item.type === "water" ? "text-blue-600" :
                        item.type === "electricity" ? "text-amber-600" :
                        item.type === "penalty" ? "text-red-600" : "text-gray-600"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">{item.description}</p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums text-gray-800 shrink-0">
                      ฿{fmt(item.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl bg-blue-600 px-4 py-4 text-white">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium opacity-80">ยอดรวมทั้งสิ้น</span>
              <span className="text-2xl font-bold tabular-nums">฿{fmt(invoice.totalAmount)}</span>
            </div>
            {invoice.status === "paid" && invoice.paidAt && (
              <p className="mt-1 text-xs opacity-70">
                ชำระแล้วเมื่อ {fmtDate(tsToDate(invoice.paidAt))} · {invoice.paymentMethod}
              </p>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            {(invoice.status === "unpaid" || invoice.status === "overdue") && (
              <button
                onClick={() => { onMarkPaid(invoice.id); onClose(); }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition"
              >
                <CreditCard className="h-4 w-4" />
                บันทึกการชำระเงิน
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              <Printer className="h-4 w-4" />
              พิมพ์
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Invoice Row ────────────────────────────────────────────── */

function InvoiceRow({ invoice, onClick }: { invoice: Invoice; onClick: () => void }) {
  const cfg = STATUS_CONFIG[invoice.status];
  const StatusIcon = cfg.icon;
  const hasPenalty = invoice.penaltyAmount > 0;

  return (
    <button
      onClick={onClick}
      className="group w-full rounded-2xl border-2 border-gray-200 bg-white px-5 py-4 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
          {invoice.roomNumber.split("-")[0]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-gray-800">{invoice.roomNumber}</span>
            <span className="text-xs text-gray-400">{invoice.zone} · {invoice.building}</span>
            {hasPenalty && (
              <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                <ShieldAlert className="h-3 w-3" />
                มีค่าปรับ
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-gray-400 truncate">{invoice.subcontractor}</p>

          <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5 text-gray-400" />
              ฿{fmt(invoice.rentAmount)}
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5 text-blue-400" />
              ฿{fmt(invoice.waterAmount)}
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              ฿{fmt(invoice.elecAmount)}
            </span>
            {hasPenalty && (
              <span className="flex items-center gap-1 text-red-500">
                <ShieldAlert className="h-3.5 w-3.5" />
                ฿{fmt(invoice.penaltyAmount)}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-2">
          <span className="text-lg font-bold tabular-nums text-gray-800">
            ฿{fmt(invoice.totalAmount)}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <StatusIcon className="h-3 w-3" />
            {cfg.label}
          </span>
          <Eye className="h-4 w-4 text-gray-300 transition group-hover:text-blue-500" />
        </div>
      </div>
    </button>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function BillingInvoicesPage() {
  const { invoices, loading }             = useInvoices();
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [statusFilter, setStatusFilter]   = useState<PaymentStatus | "all">("all");
  const [zoneFilter, setZoneFilter]       = useState<string>("all");
  const [search, setSearch]               = useState("");

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        <p className="text-sm text-gray-400">กำลังโหลดใบแจ้งหนี้...</p>
      </div>
    );
  }

  const totalDue     = invoices.filter((i) => i.status !== "void").reduce((s, i) => s + i.totalAmount, 0);
  const totalPaid    = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.totalAmount, 0);
  const totalUnpaid  = invoices.filter((i) => i.status === "unpaid").reduce((s, i) => s + i.totalAmount, 0);
  const totalOverdue = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.totalAmount, 0);
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;
  const paidCount    = invoices.filter((i) => i.status === "paid").length;

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (statusFilter !== "all" && inv.status !== statusFilter) return false;
      if (zoneFilter !== "all" && inv.zone !== zoneFilter) return false;
      if (search && !inv.roomNumber.toLowerCase().includes(search.toLowerCase()) &&
          !inv.subcontractor.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [invoices, statusFilter, zoneFilter, search]);

  async function markPaid(id: string) {
    await updateInvoiceStatus(id, "paid", "เงินสด");
  }

  const zones = useMemo(() => {
    const s = new Set(invoices.map((i) => i.zone).filter(Boolean));
    return Array.from(s).sort();
  }, [invoices]);

  const statuses: { value: PaymentStatus | "all"; label: string }[] = [
    { value: "all",     label: "ทั้งหมด" },
    { value: "unpaid",  label: "ยังไม่ชำระ" },
    { value: "overdue", label: "เกินกำหนด" },
    { value: "paid",    label: "ชำระแล้ว" },
    { value: "void",    label: "ยกเลิก" },
  ];

  const statusCounts: Record<string, number> = useMemo(() => {
    const c: Record<string, number> = { all: invoices.length };
    invoices.forEach((inv) => { c[inv.status] = (c[inv.status] ?? 0) + 1; });
    return c;
  }, [invoices]);

  return (
    <div className="pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          ใบแจ้งหนี้รายเดือน{" "}
          <span className="text-lg font-normal text-gray-400">Monthly Invoices</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          ประจำเดือน{" "}
          <span className="font-semibold text-blue-600">{fmtMonth(BILLING_MONTH)}</span>
          {" — "}ครบกำหนดชำระ{" "}
          <span className="font-semibold text-gray-700">{fmtDate(DUE_DATE)}</span>
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-400">ยอดรวมทั้งหมด</span>
          </div>
          <p className="text-xl font-bold tabular-nums text-gray-800">฿{fmt(totalDue)}</p>
          <p className="mt-0.5 text-xs text-gray-400">{invoices.length} ใบ</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-600">ชำระแล้ว</span>
          </div>
          <p className="text-xl font-bold tabular-nums text-emerald-700">฿{fmt(totalPaid)}</p>
          <p className="mt-0.5 text-xs text-emerald-500">{paidCount} ห้อง</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium text-amber-600">ค้างชำระ</span>
          </div>
          <p className="text-xl font-bold tabular-nums text-amber-700">฿{fmt(totalUnpaid)}</p>
          <p className="mt-0.5 text-xs text-amber-500">รอชำระ</p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium text-red-600">เกินกำหนด</span>
          </div>
          <p className="text-xl font-bold tabular-nums text-red-700">฿{fmt(totalOverdue)}</p>
          <p className="mt-0.5 text-xs text-red-500">{overdueCount} ห้อง</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาห้องหรือผู้รับเหมา..."
            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm outline-none hover:border-gray-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-9 text-sm outline-none hover:border-gray-400 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">ทุกโซน</option>
            {zones.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        <SlidersHorizontal className="h-5 w-5 shrink-0 text-gray-300 hidden sm:block" />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {statuses.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              statusFilter === value
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:border-gray-400"
            }`}
          >
            {label}
            <span className={`ml-1.5 tabular-nums ${statusFilter === value ? "text-blue-200" : "text-gray-400"}`}>
              {statusCounts[value] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {overdueCount > 0 && statusFilter !== "paid" && statusFilter !== "void" && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">
            มี <strong>{overdueCount} ห้อง</strong> ที่เลยกำหนดชำระแล้ว คิดเป็น{" "}
            <strong>฿{fmt(totalOverdue)}</strong>
          </p>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white text-center">
          <Receipt className="h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-400">ไม่พบใบแจ้งหนี้ที่ตรงกับตัวกรอง</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => (
            <InvoiceRow
              key={inv.id}
              invoice={inv}
              onClick={() => setActiveInvoice(inv)}
            />
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="mt-4 text-center text-xs text-gray-400">
          แสดง {filtered.length} จาก {invoices.length} ใบแจ้งหนี้
        </p>
      )}

      {activeInvoice && (
        <InvoiceModal
          invoice={activeInvoice}
          onClose={() => setActiveInvoice(null)}
          onMarkPaid={(id) => {
            markPaid(id);
            setActiveInvoice(null);
          }}
        />
      )}
    </div>
  );
}
