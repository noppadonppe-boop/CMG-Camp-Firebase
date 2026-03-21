"use client";

import { useCamp } from "@/context/CampContext";
import { useDashboard } from "@/lib/db/useDashboard";
import {
  Users,
  UserCheck,
  BedDouble,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart2,
  Loader2,
} from "lucide-react";

export default function DashboardClient() {
  const { selectedCamp } = useCamp();
  const { data, loading } = useDashboard(selectedCamp.id);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <p className="text-sm text-gray-400">โหลดข้อมูล Dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <AlertTriangle className="h-8 w-8 text-amber-400" />
        <p className="text-sm text-gray-500">ไม่พบข้อมูลสำหรับแคมป์นี้</p>
        <p className="text-xs text-gray-400">กรุณาไปที่ <span className="font-mono">/admin/seed</span> เพื่อ seed ข้อมูล</p>
      </div>
    );
  }

  const { stats, logs, chartData } = data;
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  const summaryCards = [
    {
      label: "คนงานทั้งหมด",
      sub2: "Total Workers",
      value: stats.totalWorkers.toLocaleString(),
      sub: "ลงทะเบียนในแคมป์นี้",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: null,
    },
    {
      label: "อยู่ในแคมป์",
      sub2: "Present in Camp",
      value: stats.present.toLocaleString(),
      sub: `เข้างานวันนี้ ${Math.round((stats.present / stats.totalWorkers) * 100)}%`,
      icon: UserCheck,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      trend: null,
    },
    {
      label: "สถานะห้องพัก",
      sub2: "Room Status",
      value: `${stats.roomsOccupied} / ${stats.roomsTotal}`,
      sub: `ว่าง ${stats.roomsTotal - stats.roomsOccupied} ห้อง`,
      icon: BedDouble,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      trend: null,
    },
    {
      label: "แจ้งเตือน",
      sub2: "Active Alerts",
      value: stats.alerts.toLocaleString(),
      sub: stats.alerts === 0 ? "ปกติ ไม่มีแจ้งเตือน" : `${stats.alerts} รายการที่ต้องดำเนินการ`,
      icon: AlertTriangle,
      iconBg: stats.alerts > 0 ? "bg-red-100" : "bg-gray-100",
      iconColor: stats.alerts > 0 ? "text-red-500" : "text-gray-400",
      trend: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">แดชบอร์ด <span className="text-lg font-normal text-gray-400">Dashboard</span></h1>
        <p className="mt-1 text-sm text-gray-500">
          ภาพรวมของ{" "}
          <span className="font-semibold text-gray-700">{selectedCamp.name}</span>
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ label, sub2, value, sub, icon: Icon, iconBg, iconColor }) => (
          <div
            key={label}
            className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-700">{label}</p>
              <p className="truncate text-[11px] text-gray-400">{sub2}</p>
              <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
              <p className="mt-0.5 truncate text-xs text-gray-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row: Access Logs + Bar Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Recent Access Logs */}
        <div className="lg:col-span-3 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-800">บันทึกการเข้า-ออก <span className="font-normal text-gray-400">Recent Access Logs</span></h2>
            <p className="text-xs text-gray-400 mt-0.5">รายการสแกนล่าสุดที่ {selectedCamp.name}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">ชื่อ-นามสกุล</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">ตำแหน่ง</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">เวลาสแกน</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">ทิศทาง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${log.avatarColor}`}
                        >
                          {log.initials}
                        </div>
                        <span className="font-medium text-gray-800">{log.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{log.role}</td>
                    <td className="px-5 py-3 text-gray-500 tabular-nums">{log.time}</td>
                    <td className="px-5 py-3">
                      {log.direction === "In" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          <ArrowDownToLine className="h-3 w-3" />
                          เข้า
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-600">
                          <ArrowUpFromLine className="h-3 w-3" />
                          ออก
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bar Chart — Daily Access Volume */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-800">ปริมาณการเข้า-ออก <span className="font-normal text-gray-400">Daily Access</span></h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">สัปดาห์นี้ — {selectedCamp.name}</p>
          </div>
          <div className="px-5 py-5">
            <div className="flex h-40 items-end gap-2">
              {chartData.map(({ day, count }) => {
                const heightPct = Math.round((count / maxCount) * 100);
                const isToday = day === "ศ.";
                return (
                  <div key={day} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-gray-500">{count}</span>
                    <div className="relative w-full">
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          isToday ? "bg-blue-500" : "bg-blue-200"
                        }`}
                        style={{ height: `${(heightPct / 100) * 128}px` }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-medium ${
                        isToday ? "text-blue-600" : "text-gray-400"
                      }`}
                    >
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Y-axis legend */}
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-xs text-gray-400">สูงสุดสัปดาห์นี้: <span className="font-semibold text-gray-600">{maxCount}</span></span>
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-500" /> วันนี้
                <span className="ml-2 inline-block h-2.5 w-2.5 rounded-sm bg-blue-200" /> วันอื่น
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
