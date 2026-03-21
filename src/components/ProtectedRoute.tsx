import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  requireApproved?: boolean;
  requireRoles?: UserRole[];
}

export default function ProtectedRoute({
  children,
  requireApproved = true,
  requireRoles,
}: ProtectedRouteProps) {
  const { firebaseUser, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!userProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">กำลังโหลดข้อมูลผู้ใช้...</p>
        </div>
      </div>
    );
  }

  if (userProfile.status === "rejected") {
    return <Navigate to="/login" state={{ error: "บัญชีของคุณถูกปฏิเสธ กรุณาติดต่อผู้ดูแลระบบ" }} replace />;
  }

  if (requireApproved && userProfile.status === "pending") {
    return <Navigate to="/pending" replace />;
  }

  if (requireRoles && requireRoles.length > 0) {
    const hasRequiredRole = requireRoles.some((role) => userProfile.roles.includes(role));
    if (!hasRequiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
