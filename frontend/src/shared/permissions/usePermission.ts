import { useAuthPermissions } from "../../modules/auth/context/useAuthPermissions";
import type { PermissionCanFlags } from "../../types/auth";

export function usePermission(action: string): boolean {
  const { permissions } = useAuthPermissions();
  return permissions.includes(action);
}

export function useCan(permission: keyof PermissionCanFlags): boolean {
  const { can } = useAuthPermissions();
  return Boolean(can[permission]);
}
