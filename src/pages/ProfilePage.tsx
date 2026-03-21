import { useState, useEffect } from "react";
import { Loader2, User, Briefcase, Mail, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile } from "@/lib/auth-service";

export default function ProfilePage() {
  const { userProfile } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName);
      setLastName(userProfile.lastName);
      setPosition(userProfile.position);
    }
  }, [userProfile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userProfile) return;

    setSaving(true);
    setSuccess(false);
    try {
      await updateUserProfile(userProfile.uid, {
        firstName,
        lastName,
        position,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Update profile failed:", err);
    } finally {
      setSaving(false);
    }
  }

  if (!userProfile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        <p className="text-sm text-gray-400">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          โปรไฟล์ของฉัน{" "}
          <span className="text-lg font-normal text-gray-400">My Profile</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">แก้ไขข้อมูลส่วนตัวของคุณ</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        {/* Profile Photo */}
        <div className="mb-8 flex items-center gap-6">
          {userProfile.photoURL ? (
            <img
              src={userProfile.photoURL}
              alt={userProfile.firstName}
              className="h-24 w-24 rounded-full border-4 border-blue-100"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-blue-100 bg-blue-50 text-2xl font-bold text-blue-700">
              {userProfile.firstName.charAt(0)}
              {userProfile.lastName.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-lg font-semibold text-gray-800">
              {userProfile.firstName} {userProfile.lastName}
            </p>
            <p className="text-sm text-gray-500">{userProfile.email}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {userProfile.roles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            ✓ บันทึกข้อมูลสำเร็จ
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ชื่อ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 py-3 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              ตำแหน่ง <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">อีเมล</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={userProfile.email}
                disabled
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-500 outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">อีเมลไม่สามารถแก้ไขได้</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                บันทึกการเปลี่ยนแปลง
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
