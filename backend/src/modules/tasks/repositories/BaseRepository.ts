import type { Pool, QueryResult, QueryResultRow } from "pg";

import type {
  CreateTaskInput,
  ListProjectTasksFilters,
  TaskRow,
  UpdateTaskInput,
} from "../types/tasks.types";

export abstract class BaseRepository {
  constructor(protected readonly pool: Pool) {
    if (!pool) throw new Error("Pool is required");
  }

  protected async query<R extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<R>> {
    return this.pool.query<R>(text, params);
  }

  abstract listByProjectId(
    projectId: string,
    filters: ListProjectTasksFilters,
  ): Promise<TaskRow[]>;
  abstract create(data: CreateTaskInput): Promise<TaskRow>;
  abstract findById(taskId: string): Promise<TaskRow | null>;
  abstract update(data: UpdateTaskInput): Promise<TaskRow | null>;
  abstract deleteById(taskId: string): Promise<boolean>;
}

