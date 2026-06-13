import type { Pool, QueryResultRow } from "pg";

import type { TenantUserRow, UpdateTenantUserInput } from "../types/users.types";

type TenantUserRowResult = TenantUserRow & QueryResultRow;

export class UsersRepository {
  constructor(private readonly pool: Pool) {
    if (!pool) {
      throw new Error("Pool is required");
    }
  }

  async listByTenant(tenantId: string): Promise<TenantUserRow[]> {
    const result = await this.pool.query<TenantUserRowResult>(
      `
      SELECT id, tenant_id, name, email, role, is_active, created_at
      FROM users
      WHERE tenant_id = $1
      ORDER BY created_at ASC
      `,
      [tenantId],
    );
    return result.rows;
  }

  async findByIdInTenant(
    userId: string,
    tenantId: string,
  ): Promise<TenantUserRow | null> {
    const result = await this.pool.query<TenantUserRowResult>(
      `
      SELECT id, tenant_id, name, email, role, is_active, created_at
      FROM users
      WHERE id = $1 AND tenant_id = $2
      `,
      [userId, tenantId],
    );
    return result.rows[0] ?? null;
  }

  async updateInTenant(
    userId: string,
    tenantId: string,
    input: UpdateTenantUserInput,
  ): Promise<TenantUserRow | null> {
    const hasRole = input.role !== undefined;
    const hasActive = input.isActive !== undefined;

    if (!hasRole && !hasActive) {
      return this.findByIdInTenant(userId, tenantId);
    }

    const result = await this.pool.query<TenantUserRowResult>(
      `
      UPDATE users
      SET
        role = COALESCE($3, role),
        is_active = COALESCE($4, is_active)
      WHERE id = $1 AND tenant_id = $2
      RETURNING id, tenant_id, name, email, role, is_active, created_at
      `,
      [
        userId,
        tenantId,
        hasRole ? input.role : null,
        hasActive ? input.isActive : null,
      ],
    );
    return result.rows[0] ?? null;
  }
}
