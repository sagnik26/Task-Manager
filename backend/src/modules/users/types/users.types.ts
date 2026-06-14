import type { UserRole } from "../../../shared/constants/users";

export type TenantUserRow = {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
};

export type TenantUser = {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
};

export type UpdateTenantUserInput = {
  role?: UserRole;
  isActive?: boolean;
};
