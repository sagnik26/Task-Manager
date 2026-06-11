import { useEffect, type ReactNode } from "react";

import { AuthContextProvider } from "../../modules/auth/context/AuthContext";
import { useAuth } from "../../modules/auth/context/useAuth";

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

