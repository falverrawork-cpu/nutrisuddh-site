import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuthStore } from "@/stores/auth-store";

type ProtectedRouteProps = {
  children: ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
};

export function ProtectedRoute({ children, requireAdmin = false, redirectTo = "/account" }: ProtectedRouteProps) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to={`${redirectTo}?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
