import type { UserRole } from "./auth";

export type TenantUser = {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
};
