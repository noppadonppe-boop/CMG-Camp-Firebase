"use client";

import { useState, useMemo } from "react";
import { useInspectionLogs, type InspectionLogDoc } from "@/lib/db/useInspectionLogs";
import { Loader2 } from "lucide-react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Building2,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  User,
  FileText,
  SlidersHorizontal,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────── */

type InspectionResult = "passed" | "failed" | "warning";
type InspectionLog = InspectionLogDoc & { result: InspectionResult };


/* ─── Config ─────────────────────────────────────────────────── */

const RESULT_CONFIG: Record<InspectionResult, {
  label: string; icon: React.ElementType;
  bg: string; text: string; border: string; dot: string;
}> = {
  passed:  { label: "ผ่าน",         icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400" },
  warning: { label: "ต้องปรับปรุง", icon: AlertTriangle, bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  dot: "bg-amber-400"  },
  failed:  { label: "ไม่ผ่าน",      icon: XCircle,      bg: "bg-red-50",     text: "text-red-700",    border: "border-red-200",    dot: "bg-red-400"    },
};

/* ─── Helpers ────────────────────────────────────────────────── */

function fmtDateTime(d: string) {
  return new Date(d).toLocaleDateString("th-TH", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}

/* ─── Detail Modal ───────────────────────────────────────────── */

function DetailModal({ log, onClose }: { log: InspectionLog; onClose: () => void }) {
  const cfg = RESULT_CONFIG[log.overallStatus as InspectionResult] ?? RESULT_CONFIG["passed"];
  const Icon = cfg.icon;
  const total = log.passCount + log.failCount + log.naCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-800">รายละเอียดการตรวจ</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[75vh] px-6 py-5 space-y-4">
          {/* Result badge */}
          <div className={`flex items-center justify-between rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
            <div>
              <p className="text-xs text-gray-500">ผลการตรวจ</p>
              <div className={`mt-1 flex items-center gap-2 ${cfg.text}`}>
                <Icon className="h-5 w-5" />
                <span className="text-lg font-bold">{cfg.label}</span>
              </div>
            </div>
            {log.penaltyCreated && (
              <span className="flex items-center gap-1.5 rounded-full bg-red-100 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600">
                <ShieldAlert className="h-3.5 w-3.5" />
                มีค่าปรับ
              </span>
            )}
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-gray-400 mb-1 flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />ห้องพัก</p>
              <p className="font-bold text-gray-800">{log.roomNumber}</p>
              <p className="text-gray-400">{log.zone}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-gray-400 mb-1 flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />วันที่ตรวจ</p>
              <p className="font-semibold text-gray-700">{fmtDateTime(log.inspectedAt)}</p>
            </div>
            <div className="col-span-2 rounded-xl bg-gray-50 p-3">
              <p className="text-gray-400 mb-1 flex items-center gap-1"><User className="h-3.5 w-3.5" />ผู้ตรวจ</p>
              <p className="font-semibold text-gray-700">{log.inspectedBy}</p>
            </div>
          </div>

          {/* Score breakdown */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">สรุปคะแนน</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">{log.passCount}</p>
                <p className="text-xs text-emerald-500">ผ่าน</p>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{log.failCount}</p>
                <p className="text-xs text-red-500">ไม่ผ่าน</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center">
                <p className="text-2xl font-bold text-gray-500">{log.naCount}</p>
                <p className="text-xs text-gray-400">N/A</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.round((log.passCount / total) * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-right text-xs text-gray-400">
              ผ่าน {Math.round((log.passCount / total) * 100)}%
            </p>
          </div>

          {/* Failed items */}
          {log.failedItems.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                รายการที่ไม่ผ่าน ({log.failedItems.length})
              </p>
              <div className="space-y-2">
                {log.failedItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <p className="text-sm text-red-700">{typeof item === "string" ? item : item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {log.notes && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />หมายเหตุ
              </p>
              <p className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-700">
                {log.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Log Row ────────────────────────────────────────────────── */

function LogRow({ log, onClick }: { log: InspectionLog; onClick: () => void }) {
  const cfg = RESULT_CONFIG[log.overallStatus as InspectionResult] ?? RESULT_CONFIG["passed"];
  const Icon = cfg.icon;
  const total = log.passCount + log.failCount + log.naCount;
  const passPct = Math.round((log.passCount / total) * 100);

  return (
    <button
      onClick={onClick}
      className="group w-full rounded-2xl border-2 border-gray-200 bg-white px-5 py-4 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-start gap-4">
        {/* Room badge */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm">
          {log.roomNumber.split("-")[0]}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-gray-800">{log.roomNumber}</span>
            <span className="text-xs text-gray-400">{log.zone}</span>
            {log.penaltyCreated && (
              <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                <ShieldAlert className="h-3 w-3" />
                มีค่าปรับ
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
            <User className="h-3.5 w-3.5" />
            <span>{log.inspectedBy}</span>
            <span>·</span>
            <Calendar className="h-3.5 w-3.5" />
            <span>{fmtDate(log.inspectedAt as string)}</span>
          </div>

          {/* Mini score bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-1.5 rounded-full ${log.overallStatus === "passed" ? "bg-emerald-400" : log.overallStatus === "warning" ? "bg-amber-400" : "bg-red-400"}`}
                style={{ width: `${passPct}%` }}
              />
            </div>
            <span className="text-[11px] text-gray-400">
              ผ่าน {log.passCount}/{total}
            </span>
            {log.failCount > 0 && (
              <span className="text-[11px] text-red-400">· ไม่ผ่าน {log.failCount}</span>
            )}
          </div>
        </div>

        {/* Status + eye */}
        <div className="shrink-0 flex flex-col items-end gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <Icon className="h-3 w-3" />
            {cfg.label}
          </span>
          <Eye className="h-4 w-4 text-gray-300 transition group-hover:text-blue-500" />
        </div>
      </div>
    </button>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function HygieneHistoryPage() {
  const { logs: rawLogs, loading } = useInspectionLogs(200);
  const logs = rawLogs as InspectionLog[];

  const [activeLog, setActiveLog]       = useState<InspectionLog | null>(null);
  const [resultFilter, setResultFilter] = useState<InspectionResult | "all">("all");
  const [zoneFilter, setZoneFilter]     = useState<string>("all");
  const [search, setSearch]             = useState("");
  const [sortDesc, setSortDesc]         = useState(true);

  const passedCount  = logs.filter((l) => l.overallStatus === "passed").length;
  const warningCount = logs.filter((l) => l.overallStatus === "warning").length;
  const failedCount  = logs.filter((l) => l.overallStatus === "failed").length;

  const resultCounts = useMemo(() => ({
    all:     logs.length,
    passed:  passedCount,
    warning: warningCount,
    failed:  failedCount,
  }), [logs.length, passedCount, warningCount, failedCount]);

  /* zones derived from actual logs */
  const allZones = useMemo(() => Array.from(new Set(logs.map((l) => l.zone))).sort(), [logs]);

  /* Filtered + sorted */
  const filtered = useMemo(() => {
    let list = logs.filter((log) => {
      const result = log.overallStatus as InspectionResult;
      if (resultFilter !== "all" && result !== resultFilter) return false;
      if (zoneFilter !== "all" && log.zone !== zoneFilter) return false;
      if (search && !log.roomNumber.toLowerCase().includes(search.toLowerCase()) &&
          !log.inspectedBy.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    list = [...list].sort((a, b) =>
      sortDesc
        ? new Date(b.inspectedAt).getTime() - new Date(a.inspectedAt).getTime()
        : new Date(a.inspectedAt).getTime() - new Date(b.inspectedAt).getTime()
    );
    return list;
  }, [logs, resultFilter, zoneFilter, search, sortDesc]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <p className="text-sm text-gray-400">โหลดประวัติการตรวจ...</p>
      </div>
    );
  }

  const filters: { value: InspectionResult | "all"; label: string }[] = [
    { value: "all",     label: "ทั้งหมด" },
    { value: "passed",  label: "ผ่าน" },
    { value: "warning", label: "ต้องปรับปรุง" },
    { value: "failed",  label: "ไม่ผ่าน" },
  ];

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          ประวัติการตรวจ{" "}
          <span className="text-lg font-normal text-gray-400">Inspection History</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          บันทึกผลการตรวจสุขอนามัยทั้งหมด — คลิกที่รายการเพื่อดูรายละเอียด
        </p>
      </div>

      {/* Summary pills */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-emerald-700">{passedCount}</p>
          <p className="text-xs text-emerald-500">ผ่าน</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-amber-700">{warningCount}</p>
          <p className="text-xs text-amber-500">ต้องปรับปรุง</p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-red-700">{failedCount}</p>
          <p className="text-xs text-red-500">ไม่ผ่าน</p>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาห้องหรือผู้ตรวจ..."
            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm outline-none hover:border-gray-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Zone filter */}
        <div className="relative">
          <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-9 text-sm outline-none hover:border-gray-400 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">ทุกโซน</option>
            {allZones.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Sort toggle */}
        <button
          onClick={() => setSortDesc((v) => !v)}
          className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-gray-400 transition"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {sortDesc ? (
            <><ChevronDown className="h-3.5 w-3.5" />ล่าสุดก่อน</>
          ) : (
            <><ChevronUp className="h-3.5 w-3.5" />เก่าสุดก่อน</>
          )}
        </button>
      </div>

      {/* Result filter pills */}
      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setResultFilter(value)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              resultFilter === value
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:border-gray-400"
            }`}
          >
            {label}
            <span className={`ml-1.5 tabular-nums ${resultFilter === value ? "text-blue-200" : "text-gray-400"}`}>
              {resultCounts[value] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Log list */}
      {filtered.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white text-center">
          <ShieldCheck className="h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-400">ไม่พบประวัติการตรวจที่ตรงกับตัวกรอง</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((log) => (
            <LogRow key={log.id} log={log} onClick={() => setActiveLog(log)} />
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="mt-4 text-center text-xs text-gray-400">
          แสดง {filtered.length} จาก {logs.length} รายการ
        </p>
      )}

      {/* Detail modal */}
      {activeLog && (
        <DetailModal log={activeLog} onClose={() => setActiveLog(null)} />
      )}
    </div>
  );
}
