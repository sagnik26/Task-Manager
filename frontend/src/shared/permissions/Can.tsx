import type { ReactNode } from "react";

import type { PermissionCanFlags } from "@/modules/auth/types/auth.types";
import { useCan } from "./usePermission";

export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: keyof PermissionCanFlags;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const allowed = useCan(permission);
  return allowed ? <>{children}</> : <>{fallback}</>;
}
