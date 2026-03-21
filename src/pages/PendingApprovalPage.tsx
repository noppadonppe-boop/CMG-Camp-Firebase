import { Clock, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/lib/auth-service";

export default function PendingApprovalPage() {
  const { userProfile } = useAuth();

  async function handleLogout() {
    await logout();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-amber-200 bg-white p-8 shadow-xl">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
              <Clock className="h-10 w-10 text-amber-600" />
            </div>
          </div>

          <h1 className="mb-3 text-center text-2xl font-bold text-gray-800">
            รอการอนุมัติ
          </h1>

          <p className="mb-6 text-center text-sm text-gray-600">
            บัญชีของคุณกำลังรอการอนุมัติจากผู้ดูแลระบบ
            <br />
            คุณจะได้รับการแจ้งเตือนเมื่อบัญชีได้รับการอนุมัติแล้ว
          </p>

          {userProfile && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ชื่อ:</span>
                  <span className="font-medium text-gray-800">
                    {userProfile.firstName} {userProfile.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">อีเมล:</span>
                  <span className="font-medium text-gray-800">{userProfile.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ตำแหน่ง:</span>
                  <span className="font-medium text-gray-800">{userProfile.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">สถานะ:</span>
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    รอการอนุมัติ
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  );
}
