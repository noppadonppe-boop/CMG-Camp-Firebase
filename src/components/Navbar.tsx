import { useState } from "react";
import { ChevronDown, Building2, Check, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCamp } from "@/context/CampContext";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/lib/auth-service";

export default function Navbar() {
  const navigate = useNavigate();
  const { selectedCamp, setSelectedCamp, camps } = useCamp();
  const { userProfile } = useAuth();
  const [campOpen, setCampOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <span className="text-sm font-semibold text-gray-700">CMG Camp Manager</span>

      <div className="flex items-center gap-4">
        {/* Camp Selector */}
        <div className="relative">
          <button
            onClick={() => setCampOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
          >
            <Building2 className="h-4 w-4 text-blue-500" />
            {selectedCamp?.name ?? "เลือกแคมป์"}
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${campOpen ? "rotate-180" : ""}`} />
          </button>

          {campOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setCampOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                {camps.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-gray-400">ไม่มีข้อมูลแคมป์</p>
                ) : (
                  camps.map((camp) => (
                    <button
                      key={camp.id}
                      onClick={() => { setSelectedCamp(camp); setCampOpen(false); }}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      {camp.name}
                      {selectedCamp?.id === camp.id && <Check className="h-4 w-4 text-blue-500" />}
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* User Profile Dropdown */}
        {userProfile && (
          <div className="relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1.5 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
            >
              {userProfile.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.firstName}
                  className="h-7 w-7 rounded-full border border-gray-200"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                  {userProfile.firstName.charAt(0)}
                  {userProfile.lastName.charAt(0)}
                </div>
              )}
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-sm font-semibold text-gray-800">
                      {userProfile.firstName} {userProfile.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{userProfile.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setProfileOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    แก้ไขโปรไฟล์
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    ออกจากระบบ
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
