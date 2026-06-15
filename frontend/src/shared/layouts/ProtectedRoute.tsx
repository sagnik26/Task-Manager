"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/modules/auth";
import { LoadingState } from "../ui/LoadingState";

export function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { isAuthenticated, isBootstrapped } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isBootstrapped && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isBootstrapped, isAuthenticated, router]);

  if (!isBootstrapped) {
    return <LoadingState label="Checking session…" />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
