import type { UserRole } from "@/modules/auth/types/auth.types";

export type TenantUser = {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
};
