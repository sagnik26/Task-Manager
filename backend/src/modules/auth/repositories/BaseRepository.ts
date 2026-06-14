import type { Pool, QueryResult, QueryResultRow } from "pg";

import type { CreateUserInput, PublicUser, UserRow } from "../types/auth.types";

/**
 * Auth module repository base.
 *
 * - Keeps the typed `query()` helper from the shared BaseRepository.
 * - Declares the repository methods this module expects.
 */
export abstract class BaseRepository {
  constructor(protected readonly pool: Pool) {
    if (!pool) {
      throw new Error("Pool is required");
    }
  }

  protected async query<R extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<R>> {
    return this.pool.query<R>(text, params);
  }

  abstract findTenantIdBySlug(slug: string): Promise<string | null>;
  abstract findByEmail(
    email: string,
    tenantId: string,
  ): Promise<UserRow | null>;
  abstract create(data: CreateUserInput): Promise<PublicUser>;
}
