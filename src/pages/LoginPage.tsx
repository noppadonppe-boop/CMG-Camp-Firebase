import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { loginWithEmail, loginWithGoogle } from "@/lib/auth-service";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, refreshProfile } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = (location.state as any)?.from?.pathname || "/dashboard";
  const stateError = (location.state as any)?.error;

  useEffect(() => {
    if (stateError) setError(stateError);
  }, [stateError]);

  useEffect(() => {
    if (!userProfile) return;
    if (userProfile.status === "rejected") {
      setError("บัญชีของคุณถูกปฏิเสธ กรุณาติดต่อผู้ดูแลระบบ");
    } else if (userProfile.status === "pending") {
      navigate("/pending", { replace: true });
    } else if (userProfile.status === "approved") {
      navigate(from, { replace: true });
    }
  }, [userProfile, navigate, from]);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      await refreshProfile();
    } catch (err: any) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else if (err.code === "auth/user-not-found") {
        setError("ไม่พบผู้ใช้งานนี้ในระบบ");
      } else {
        setError(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      await refreshProfile();
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        setError("ยกเลิกการเข้าสู่ระบบ");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("โดเมนนี้ไม่ได้รับอนุญาตให้ใช้งาน Google Sign-in");
      } else {
        setError(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
            <span className="text-2xl font-bold text-white">CMG</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">เข้าสู่ระบบ</h1>
          <p className="mt-2 text-sm text-gray-500">CMG Camp Manager</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">อีเมล</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              เข้าสู่ระบบ
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">หรือ</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            เข้าสู่ระบบด้วย Google
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            ยังไม่มีบัญชี?{" "}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
              ลงทะเบียนที่นี่
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
