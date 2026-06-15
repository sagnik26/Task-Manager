import { useEffect, type ReactNode } from "react";

import { AuthContextProvider, useAuth } from "@/modules/auth";

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
    void bootstrap();
  }, [bootstrap]);

  return <>{children}</>;
}

