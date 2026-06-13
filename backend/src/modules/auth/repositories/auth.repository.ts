import type { Pool, QueryResultRow } from "pg";

import { UserRole } from "../../../shared/constants/users";
import { BaseRepository } from "./BaseRepository";
import type {
  CreateUserInput,
  PublicUser,
  UserProfile,
  UserRow,
} from "../types/auth.types";

type UserRowResult = QueryResultRow & UserRow;

export class AuthRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool);
  }

  async findTenantIdBySlug(slug: string): Promise<string | null> {
    const result = await this.query<{ id: string } & QueryResultRow>(
      `SELECT id FROM tenants WHERE slug = $1`,
      [slug],
    );
    return result.rows[0]?.id ?? null;
  }

  async findById(id: string): Promise<UserProfile | null> {
    const result = await this.query<
      {
        id: string;
        tenant_id: string;
        name: string;
        email: string;
        role: UserRole;
        is_active: boolean;
        created_at: Date;
      } & QueryResultRow
    >(
      `SELECT id, tenant_id, name, email, role, is_active, created_at
       FROM users
       WHERE id = $1`,
      [id],
    );
    const row = result.rows[0];
    if (!row) return null;

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

  async findByEmail(email: string, tenantId: string): Promise<UserRow | null> {
    const result = await this.query<UserRowResult>(
      `SELECT id, tenant_id, name, email, password_hash, role, is_active, created_at
       FROM users
       WHERE email = $1 AND tenant_id = $2`,
      [email, tenantId],
    );
    const row = result.rows[0];
    return row ?? null;
  }

  async create(data: CreateUserInput): Promise<PublicUser> {
    const result = await this.query<
      {
        id: string;
        tenant_id: string;
        name: string;
        email: string;
        role: UserRole;
        is_active: boolean;
      } & QueryResultRow
    >(
      `INSERT INTO users (name, email, password_hash, tenant_id, role, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, tenant_id, name, email, role, is_active`,
      [
        data.name,
        data.email,
        data.hashedPassword,
        data.tenantId,
        UserRole.Developer,
      ],
    );
    const row = result.rows[0];
    if (!row) {
      throw new Error("Failed to create user");
    }
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      email: row.email,
      role: row.role,
      isActive: row.is_active,
    };
  }
}
