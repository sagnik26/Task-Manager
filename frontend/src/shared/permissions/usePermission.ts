import { useAuthPermissions } from "@/modules/auth";
import type { PermissionCanFlags } from "@/modules/auth/types/auth.types";

export function usePermission(action: string): boolean {
  const { permissions } = useAuthPermissions();
  return permissions.includes(action);
}

export function useCan(permission: keyof PermissionCanFlags): boolean {
  const { can } = useAuthPermissions();
  return Boolean(can[permission]);
}
