import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../../modules/auth/context/useAuth.ts";
import { LoadingState } from "../ui/LoadingState";

export function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { isAuthenticated, isBootstrapped } = useAuth();

  if (!isBootstrapped) {
    return <LoadingState label="Checking session…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

