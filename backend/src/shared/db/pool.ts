import type { Pool } from "pg";

import postgres from "../config/postgres";

/**
 * Single shared pg Pool for repositories. Prefer injecting this into
 * constructors (see BaseRepository) instead of importing this module ad hoc.
 */
export function getPool(): Pool {
  return postgres.getPool();
}
