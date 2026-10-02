import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Loader2, Mail, Lock, AlertCircle, House, ShieldCheck, ArrowRight, Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

  const loginState = location.state as { from?: { pathname?: string }; error?: string } | null;
  const from = loginState?.from?.pathname || "/";
  const stateError = loginState?.error;

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
    <div className="auth-page">
      <div className="login-shell">
        <header className="flex items-center justify-between gap-4">
          <div className="login-brand">
            <span className="brand-mark"><House className="h-5 w-5" strokeWidth={1.8} /></span>
            <div><p className="text-sm font-bold tracking-tight">CMG <span className="font-normal text-[#77778d]">Camp Manager</span></p><p className="mt-0.5 text-[9px] tracking-[.16em] text-[#9c98ae]">A BETTER PLACE TO LIVE</p></div>
          </div>
          <Link to="/register" className="rounded-full border border-[#e1dcf1] bg-white/70 px-4 py-2 text-xs font-medium text-[#7356c9] transition hover:bg-[#eee8ff]">สร้างบัญชี</Link>
        </header>
        <main className="login-grid">
          <section className="login-intro" aria-label="CMG Camp Manager">
            <p className="login-eyebrow">YOUR CAMP, CONNECTED.</p>
            <h1 className="login-title">ดูแลทุกการพักอาศัย<br /><span>ให้เป็นเรื่องง่าย</span></h1>
            <p className="login-description">เชื่อมทุกงานของแคมป์ไว้ในที่เดียว ตั้งแต่ผู้อยู่อาศัย ห้องพัก สุขอนามัย ไปจนถึงการเงิน</p>
            <div className="login-landscape" aria-hidden="true">
              <div className="login-orbit" />
              <div className="login-art"><img src="/images/camp-mountains.png" alt="" fetchPriority="high" /></div>
              <div className="login-art-card">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0ebff] text-[#8063d3]"><ShieldCheck className="h-5 w-5" /></span>
                <div><p className="text-xs font-semibold text-[#36334c]">จัดการอย่างเป็นระบบ</p><p className="mt-1 text-[10px] text-[#9290a4]">ดูแลแคมป์ได้ในทุกวัน</p></div>
              </div>
            </div>
          </section>
          <section className="login-form-card" aria-labelledby="login-heading">
            <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-[#f2edff] px-3 py-1.5 text-[10px] font-medium text-[#8568ce]"><span className="h-1.5 w-1.5 rounded-full bg-[#9b7ce5]" />CMG WORKSPACE</span>
            <h2 id="login-heading" className="text-2xl font-bold tracking-tight text-[#292b42]">ยินดีต้อนรับกลับ</h2>
            <p className="mb-7 mt-2 text-xs leading-relaxed text-[#9794a8]">เข้าสู่ระบบเพื่อเริ่มดูแลแคมป์ของคุณ</p>
          {error && (
            <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-2 block text-xs font-medium text-[#5e5c72]">อีเมล</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="login-email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#e8e5f0] bg-[#fcfbff] py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#b3afc1] focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="mb-2 block text-xs font-medium text-[#5e5c72]">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#e8e5f0] bg-[#fcfbff] py-3 pl-11 pr-11 text-sm outline-none transition placeholder:text-[#b3afc1] focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"} aria-pressed={showPassword} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#aaa5ba] hover:text-blue-600">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-primary flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white transition disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              เข้าสู่ระบบ
              {!loading && <ArrowRight className="h-4 w-4" />}
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
            className="flex w-full items-center justify-center gap-3 rounded-full border border-[#e8e5f0] bg-white py-3 text-xs font-medium text-[#666176] transition hover:bg-[#faf8ff] disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            เข้าสู่ระบบด้วย Google
          </button>

          <p className="mt-6 text-center text-xs text-[#9691a7]">
            ยังไม่มีบัญชี?{" "}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
              ลงทะเบียนที่นี่
            </Link>
          </p>
          </section>
        </main>
        <footer className="auth-footer"><span>CMG Camp Manager · ระบบบริหารจัดการแคมป์</span><span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#9d8cce]" />เข้าถึงข้อมูลตามสิทธิ์ของคุณ</span></footer>
      </div>
    </div>
  );
}
