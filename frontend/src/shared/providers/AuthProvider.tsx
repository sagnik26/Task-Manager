"use client";

import { useEffect, type ReactNode } from "react";

import { AuthContextProvider, useAuth } from "@/modules/auth";
import { useAuthStore } from "@/modules/auth/context/auth.store";

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContextProvider>
      <AuthBootstrapper>{children}</AuthBootstrapper>
    </AuthContextProvider>
  );
}

function AuthBootstrapper({ children }: { children: ReactNode }) {
  const { bootstrap } = useAuth();

  useEffect(() => {
    useAuthStore.persist.rehydrate();
    void bootstrap();
  }, [bootstrap]);

  return <>{children}</>;
}
