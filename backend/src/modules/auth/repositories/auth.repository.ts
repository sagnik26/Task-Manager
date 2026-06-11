import type { Pool, QueryResultRow } from "pg";

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

  async findById(id: string): Promise<UserProfile | null> {
    const result = await this.query<UserProfile & QueryResultRow>(
      `SELECT id, name, email, created_at
       FROM users
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    const result = await this.query<UserRowResult>(
      `SELECT id, name, email, password, created_at
       FROM users
       WHERE email = $1`,
      [email],
    );
    const row = result.rows[0];
    return row ?? null;
  }

  async create(data: CreateUserInput): Promise<PublicUser> {
    const result = await this.query<PublicUser & QueryResultRow>(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [data.name, data.email, data.hashedPassword],
    );
    const row = result.rows[0];
    if (!row) {
      throw new Error("Failed to create user");
    }
    return { id: row.id, name: row.name, email: row.email };
  }
}
