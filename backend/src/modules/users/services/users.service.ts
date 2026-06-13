import logger from "../../../shared/config/logger";
import { AppError } from "../../../shared/utils/AppError";
import { UsersRepository } from "../repositories/users.repository";
import type { TenantUser, UpdateTenantUserInput } from "../types/users.types";
import type { TenantUserRow } from "../types/users.types";

export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {
    if (!usersRepository) {
      throw new Error("UsersRepository is required");
    }
  }

  private toTenantUser(row: TenantUserRow): TenantUser {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      email: row.email,
      role: row.role,
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }

  async listUsers(tenantId: string): Promise<TenantUser[]> {
    const rows = await this.usersRepository.listByTenant(tenantId);
    return rows.map((row) => this.toTenantUser(row));
  }

  async updateUser(
    tenantId: string,
    userId: string,
    input: UpdateTenantUserInput,
    actorUserId: string,
  ): Promise<TenantUser> {
    if (userId === actorUserId && input.isActive === false) {
      throw new AppError("cannot deactivate your own account", 400);
    }

    const row = await this.usersRepository.updateInTenant(userId, tenantId, input);
    if (!row) {
      throw new AppError("not found", 404);
    }

    logger.info("Tenant user updated", { userId, tenantId, actorUserId });
    return this.toTenantUser(row);
  }
}
