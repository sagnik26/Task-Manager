import type { UserRole } from "../../../shared/constants/users";

export type UserRow = {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  role: UserRole;
  isActive: boolean;
};

export type UserProfile = PublicUser & {
  createdAt: Date;
};

export type CreateUserInput = {
  name: string;
  email: string;
  hashedPassword: string;
  tenantId: string;
};
