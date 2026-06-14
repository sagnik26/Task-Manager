import { useAuthStore } from "../../../store";
import type { PermissionCanFlags } from "../../../types/auth";

export function useAuthPermissions() {
  const permissions = useAuthStore((s) => s.permissions);

  return {
    permissions: permissions?.permissions ?? [],
    can: permissions?.can ?? ({} as PermissionCanFlags),
    role: permissions?.role ?? null,
  };
}
