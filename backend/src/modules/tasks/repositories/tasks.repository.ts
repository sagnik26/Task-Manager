import type { Pool, QueryResultRow } from "pg";

import { BaseRepository } from "./BaseRepository";
import type {
  CreateTaskInput,
  ListProjectTasksFilters,
  TaskRow,
  UpdateTaskInput,
} from "../types/tasks.types";

export class TasksRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool);
  }

  async listByProjectId(
    projectId: string,
    filters: ListProjectTasksFilters,
  ): Promise<TaskRow[]> {
    const where: string[] = ["project_id = $1"];
    const params: unknown[] = [projectId];

    if (filters.status) {
      params.push(filters.status);
      where.push(`status = $${params.length}`);
    }
    if (filters.assigneeId) {
      params.push(filters.assigneeId);
      where.push(`assignee_id = $${params.length}`);
    }

    const result = await this.query<TaskRow & QueryResultRow>(
      `SELECT id, title, description, status, priority,
              project_id, assignee_id, created_by, due_date,
              created_at, updated_at
       FROM tasks
       WHERE ${where.join(" AND ")}
       ORDER BY created_at DESC`,
      params,
    );
    return result.rows;
  }

  async create(data: CreateTaskInput): Promise<TaskRow> {
    const result = await this.query<TaskRow & QueryResultRow>(
      `INSERT INTO tasks (
        title, description, status, priority,
        project_id, assignee_id, created_by, due_date
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id, title, description, status, priority,
                project_id, assignee_id, created_by, due_date,
                created_at, updated_at`,
      [
        data.title,
        data.description ?? null,
        data.status ?? "todo",
        data.priority ?? "medium",
        data.projectId,
        data.assigneeId ?? null,
        data.createdBy,
        data.dueDate ?? null,
      ],
    );
    const row = result.rows[0];
    if (!row) throw new Error("Failed to create task");
    return row;
  }

  async findById(taskId: string): Promise<TaskRow | null> {
    const result = await this.query<TaskRow & QueryResultRow>(
      `SELECT id, title, description, status, priority,
              project_id, assignee_id, created_by, due_date,
              created_at, updated_at
       FROM tasks
       WHERE id = $1`,
      [taskId],
    );
    return result.rows[0] ?? null;
  }

  async update(data: UpdateTaskInput): Promise<TaskRow | null> {
    const sets: string[] = [];
    const params: unknown[] = [];

    const push = (sql: string, value: unknown) => {
      params.push(value);
      sets.push(`${sql} = $${params.length}`);
    };

    if (data.title !== undefined) push("title", data.title);
    if (data.description !== undefined) push("description", data.description);
    if (data.status !== undefined) push("status", data.status);
    if (data.priority !== undefined) push("priority", data.priority);
    if (data.assigneeId !== undefined) push("assignee_id", data.assigneeId);
    if (data.dueDate !== undefined) push("due_date", data.dueDate);

    if (sets.length === 0) {
      return this.findById(data.taskId);
    }

    params.push(data.taskId);

    const result = await this.query<TaskRow & QueryResultRow>(
      `UPDATE tasks
       SET ${sets.join(", ")}, updated_at = NOW()
       WHERE id = $${params.length}
       RETURNING id, title, description, status, priority,
                 project_id, assignee_id, created_by, due_date,
                 created_at, updated_at`,
      params,
    );
    return result.rows[0] ?? null;
  }

  async deleteById(taskId: string): Promise<boolean> {
    const result = await this.query<{ id: string } & QueryResultRow>(
      `DELETE FROM tasks
       WHERE id = $1
       RETURNING id`,
      [taskId],
    );
    return (result.rows[0]?.id ?? null) !== null;
  }
}

