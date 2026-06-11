import type { Pool, QueryResultRow } from "pg";

import { BaseRepository } from "./BaseRepository";
import type { ProjectRow, TaskRow } from "../types/projects.types";

type ProjectRowResult = ProjectRow & QueryResultRow;
type TaskRowResult = TaskRow & QueryResultRow;

export class ProjectsRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool);
  }

  async listForUser(userId: string): Promise<ProjectRow[]> {
    const result = await this.query<ProjectRowResult>(
      `
      SELECT DISTINCT p.id, p.name, p.description, p.owner_id, p.created_at
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id
      WHERE p.owner_id = $1
         OR t.assignee_id = $1
         OR t.created_by = $1
      ORDER BY p.created_at DESC
      `,
      [userId],
    );
    return result.rows;
  }

  async findById(projectId: string): Promise<ProjectRow | null> {
    const result = await this.query<ProjectRowResult>(
      `
      SELECT id, name, description, owner_id, created_at
      FROM projects
      WHERE id = $1
      `,
      [projectId],
    );
    return result.rows[0] ?? null;
  }

  async canUserAccessProject(
    userId: string,
    projectId: string,
  ): Promise<boolean> {
    const result = await this.query<{ allowed: boolean } & QueryResultRow>(
      `
      SELECT EXISTS (
        SELECT 1
        FROM projects p
        LEFT JOIN tasks t ON t.project_id = p.id
        WHERE p.id = $2
          AND (p.owner_id = $1 OR t.assignee_id = $1 OR t.created_by = $1)
      ) AS allowed
      `,
      [userId, projectId],
    );
    return result.rows[0]?.allowed ?? false;
  }

  async create(input: {
    name: string;
    description: string | null;
    ownerId: string;
  }): Promise<ProjectRow> {
    const result = await this.query<ProjectRowResult>(
      `
      INSERT INTO projects (name, description, owner_id)
      VALUES ($1, $2, $3)
      RETURNING id, name, description, owner_id, created_at
      `,
      [input.name, input.description, input.ownerId],
    );
    const row = result.rows[0];
    if (!row) {
      throw new Error("Failed to create project");
    }
    return row;
  }

  async updateById(
    projectId: string,
    input: {
      name?: string;
      description?: string | null;
    },
  ): Promise<ProjectRow | null> {
    const hasName = input.name !== undefined;
    const hasDescription = input.description !== undefined;

    if (!hasName && !hasDescription) {
      return this.findById(projectId);
    }

    const result = await this.query<ProjectRowResult>(
      `
      UPDATE projects
      SET
        name = COALESCE($2, name),
        description = CASE
          WHEN $3::boolean THEN $4
          ELSE description
        END
      WHERE id = $1
      RETURNING id, name, description, owner_id, created_at
      `,
      [
        projectId,
        hasName ? input.name : null,
        hasDescription,
        input.description ?? null,
      ],
    );
    return result.rows[0] ?? null;
  }

  async deleteById(projectId: string): Promise<boolean> {
    const result = await this.query<{ id: string } & QueryResultRow>(
      `
      DELETE FROM projects
      WHERE id = $1
      RETURNING id
      `,
      [projectId],
    );
    return Boolean(result.rows[0]?.id);
  }

  async listTasksForProject(projectId: string): Promise<TaskRow[]> {
    const result = await this.query<TaskRowResult>(
      `
      SELECT
        id,
        title,
        description,
        status,
        priority,
        project_id,
        assignee_id,
        created_by,
        due_date,
        created_at,
        updated_at
      FROM tasks
      WHERE project_id = $1
      ORDER BY created_at DESC
      `,
      [projectId],
    );
    return result.rows;
  }

  async countTasksByStatusForProject(
    projectId: string,
  ): Promise<Array<{ status: TaskRow["status"]; count: number }>> {
    const result = await this.query<
      { status: TaskRow["status"]; count: number } & QueryResultRow
    >(
      `
      SELECT status, COUNT(*)::int AS count
      FROM tasks
      WHERE project_id = $1
      GROUP BY status
      `,
      [projectId],
    );
    return result.rows;
  }

  async countTasksByAssigneeForProject(
    projectId: string,
  ): Promise<Array<{ assignee_id: string | null; count: number }>> {
    const result = await this.query<
      { assignee_id: string | null; count: number } & QueryResultRow
    >(
      `
      SELECT assignee_id, COUNT(*)::int AS count
      FROM tasks
      WHERE project_id = $1
      GROUP BY assignee_id
      ORDER BY count DESC, assignee_id NULLS LAST
      `,
      [projectId],
    );
    return result.rows;
  }
}
