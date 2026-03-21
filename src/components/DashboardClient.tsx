import { Users, BedDouble, Bell, TrendingUp, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useCamp } from "@/context/CampContext";
import { useDashboard } from "@/lib/db/useDashboard";

export default function DashboardClient() {
  const { selectedCamp } = useCamp();
  const { data, loading } = useDashboard(selectedCamp?.id ?? "");

  if (loading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <p className="text-sm text-gray-400">กำลังโหลด...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <p className="text-sm text-gray-400">ไม่พบข้อมูลสำหรับแคมป์นี้</p>
      </div>
    );
  }

  const { stats, logs, chartData } = data;
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard{" "}
          <span className="text-lg font-normal text-gray-400">{selectedCamp?.name}</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">ภาพรวมแคมป์แบบเรียลไทม์</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5 text-blue-500" />}
          label="คนงานทั้งหมด"
          value={stats.totalWorkers}
          bg="bg-blue-50"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
          label="อยู่ในแคมป์"
          value={stats.present}
          bg="bg-emerald-50"
        />
        <StatCard
          icon={<BedDouble className="h-5 w-5 text-violet-500" />}
          label="ห้องที่ใช้งาน"
          value={`${stats.roomsOccupied}/${stats.roomsTotal}`}
          bg="bg-violet-50"
        />
        <StatCard
          icon={<Bell className="h-5 w-5 text-orange-500" />}
          label="แจ้งเตือน"
          value={stats.alerts}
          bg="bg-orange-50"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent access logs */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">การเข้า-ออกล่าสุด</h2>
          {logs.length === 0 ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-gray-400">ยังไม่มีข้อมูลการเข้า-ออก</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${log.avatarColor}`}
                  >
                    {log.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{log.name}</p>
                    <p className="text-xs text-gray-400">{log.role}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-gray-400">{log.time}</span>
                    {log.direction === "In" ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <ArrowDownLeft className="h-3.5 w-3.5 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">ปริมาณเข้า-ออกรายวัน</h2>
          {chartData.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-gray-400">ยังไม่มีข้อมูลกราฟ</p>
            </div>
          ) : (
            <div className="flex h-40 items-end gap-2">
              {chartData.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-400">{d.count}</span>
                  <div
                    className="w-full rounded-t-sm bg-blue-500 transition-all"
                    style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: "4px" }}
                  />
                  <span className="text-[10px] text-gray-500">{d.day}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  bg: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="mt-0.5 text-xs text-gray-500">{label}</p>
    </div>
  );
}
