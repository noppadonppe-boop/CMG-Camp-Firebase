import { useState } from "react";
import { Users, CheckCircle, XCircle, Clock, Shield, Loader2, ChevronDown } from "lucide-react";
import { useUsers } from "@/lib/db/useUsers";
import { approveUser, rejectUser, updateUserProfile } from "@/lib/auth-service";
import { useAuth } from "@/context/AuthContext";
import { USER_ROLES, type UserRole } from "@/types/auth";

export default function UserManagementPage() {
  const { users, loading } = useUsers();
  const { userProfile: currentUser } = useAuth();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [saving, setSaving] = useState(false);

  const filteredUsers = users.filter((u) => {
    if (filter === "all") return true;
    return u.status === filter;
  });

  async function handleApprove(uid: string) {
    if (!currentUser) return;
    try {
      await approveUser(uid, currentUser.uid);
    } catch (err) {
      console.error("Approve failed:", err);
    }
  }

  async function handleReject(uid: string) {
    if (!currentUser) return;
    try {
      await rejectUser(uid, currentUser.uid);
    } catch (err) {
      console.error("Reject failed:", err);
    }
  }

  async function handleSaveRoles(uid: string) {
    setSaving(true);
    try {
      await updateUserProfile(uid, { roles: selectedRoles });
      setEditingUser(null);
    } catch (err) {
      console.error("Update roles failed:", err);
    } finally {
      setSaving(false);
    }
  }

  function startEditRoles(uid: string, currentRoles: UserRole[]) {
    setEditingUser(uid);
    setSelectedRoles(currentRoles);
  }

  function toggleRole(role: UserRole) {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        <p className="text-sm text-gray-400">กำลังโหลดข้อมูลผู้ใช้...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          จัดการผู้ใช้งาน{" "}
          <span className="text-lg font-normal text-gray-400">User Management</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          อนุมัติ ปฏิเสธ และจัดการสิทธิ์ผู้ใช้งานในระบบ
        </p>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2">
        {[
          { value: "all", label: "ทั้งหมด", count: users.length },
          { value: "pending", label: "รออนุมัติ", count: users.filter((u) => u.status === "pending").length },
          { value: "approved", label: "อนุมัติแล้ว", count: users.filter((u) => u.status === "approved").length },
          { value: "rejected", label: "ปฏิเสธ", count: users.filter((u) => u.status === "rejected").length },
        ].map(({ value, label, count }) => (
          <button
            key={value}
            onClick={() => setFilter(value as any)}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
              filter === value
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {label} <span className="ml-1 text-xs opacity-60">({count})</span>
          </button>
        ))}
      </div>

      {/* Users table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-600">ผู้ใช้</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600">ตำแหน่ง</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600">สิทธิ์</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600">สถานะ</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  ไม่พบผู้ใช้งานในหมวดนี้
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.uid} className="transition hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.firstName}
                          className="h-10 w-10 rounded-full border-2 border-gray-200"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.position}</td>
                  <td className="px-6 py-4">
                    {editingUser === user.uid ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {USER_ROLES.map((role) => (
                            <button
                              key={role}
                              onClick={() => toggleRole(role)}
                              className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                                selectedRoles.includes(role)
                                  ? "border-blue-500 bg-blue-50 text-blue-700"
                                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveRoles(user.uid)}
                            disabled={saving || selectedRoles.length === 0}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {saving ? "กำลังบันทึก..." : "บันทึก"}
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700"
                          >
                            <Shield className="h-3 w-3" />
                            {role}
                          </span>
                        ))}
                        <button
                          onClick={() => startEditRoles(user.uid, user.roles)}
                          className="ml-2 text-xs text-blue-600 hover:text-blue-700"
                        >
                          แก้ไข
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.status === "approved" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        <CheckCircle className="h-3 w-3" />
                        อนุมัติแล้ว
                      </span>
                    )}
                    {user.status === "pending" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        <Clock className="h-3 w-3" />
                        รออนุมัติ
                      </span>
                    )}
                    {user.status === "rejected" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                        <XCircle className="h-3 w-3" />
                        ปฏิเสธ
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(user.uid)}
                          className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          อนุมัติ
                        </button>
                        <button
                          onClick={() => handleReject(user.uid)}
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          ปฏิเสธ
                        </button>
                      </div>
                    )}
                    {user.status === "rejected" && (
                      <button
                        onClick={() => handleApprove(user.uid)}
                        className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        อนุมัติอีกครั้ง
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="border-t border-gray-100 px-6 py-3 text-xs text-gray-400">
          แสดงทั้งหมด {filteredUsers.length} ผู้ใช้
        </div>
      </div>
    </div>
  );
}
