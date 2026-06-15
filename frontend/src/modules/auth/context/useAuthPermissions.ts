import { useAuthStore } from "@/modules/auth/context/auth.store";
import type { PermissionCanFlags } from "@/modules/auth/types/auth.types";

export function useAuthPermissions() {
  const permissions = useAuthStore((s) => s.permissions);

  return {
    permissions: permissions?.permissions ?? [],
    can: permissions?.can ?? ({} as PermissionCanFlags),
    role: permissions?.role ?? null,
  };
}
