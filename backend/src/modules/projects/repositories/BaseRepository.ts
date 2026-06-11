import type { Pool, QueryResult, QueryResultRow } from "pg";

import type { ProjectRow, TaskRow } from "../types/projects.types";

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

  abstract listForUser(userId: string): Promise<ProjectRow[]>;
  abstract findById(projectId: string): Promise<ProjectRow | null>;
  abstract canUserAccessProject(
    userId: string,
    projectId: string,
  ): Promise<boolean>;
  abstract create(input: {
    name: string;
    description: string | null;
    ownerId: string;
  }): Promise<ProjectRow>;
  abstract updateById(
    projectId: string,
    input: {
      name?: string;
      description?: string | null;
    },
  ): Promise<ProjectRow | null>;
  abstract deleteById(projectId: string): Promise<boolean>;
  abstract listTasksForProject(projectId: string): Promise<TaskRow[]>;
  abstract countTasksByStatusForProject(
    projectId: string,
  ): Promise<Array<{ status: TaskRow["status"]; count: number }>>;
  abstract countTasksByAssigneeForProject(
    projectId: string,
  ): Promise<Array<{ assignee_id: string | null; count: number }>>;
}

