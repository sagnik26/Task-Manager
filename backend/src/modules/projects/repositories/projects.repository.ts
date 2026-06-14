import type { Pool, QueryResultRow } from "pg";

import { ProjectStatus } from "../../../shared/constants/projects";
import { UserRole } from "../../../shared/constants/users";
import { BaseRepository } from "./BaseRepository";
import type { ProjectRow, TaskRow } from "../types/projects.types";

type ProjectRowResult = ProjectRow & QueryResultRow;
type TaskRowResult = TaskRow & QueryResultRow;

export class ProjectsRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool);
  }

  async listForUser(
    userId: string,
    tenantId: string,
    role: UserRole,
  ): Promise<ProjectRow[]> {
    if (role === UserRole.Admin) {
      const result = await this.query<ProjectRowResult>(
        `
        SELECT id, name, description, tenant_id, status, created_at
        FROM projects
        WHERE tenant_id = $1
        ORDER BY created_at DESC
        `,
        [tenantId],
      );
      return result.rows;
    }

    const result = await this.query<ProjectRowResult>(
      `
      SELECT p.id, p.name, p.description, p.tenant_id, p.status, p.created_at
      FROM projects p
      INNER JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1
      WHERE p.tenant_id = $2
      ORDER BY p.created_at DESC
      `,
      [userId, tenantId],
    );
    return result.rows;
  }

  async findById(projectId: string): Promise<ProjectRow | null> {
    const result = await this.query<ProjectRowResult>(
      `
      SELECT id, name, description, tenant_id, status, created_at
      FROM projects
      WHERE id = $1
      `,
      [projectId],
    );
    return result.rows[0] ?? null;
  }

  async canUserAccessProject(
    userId: string,
    tenantId: string,
    role: UserRole,
    projectId: string,
  ): Promise<boolean> {
    if (role === UserRole.Admin) {
      const result = await this.query<{ allowed: boolean } & QueryResultRow>(
        `
        SELECT EXISTS (
          SELECT 1 FROM projects WHERE id = $1 AND tenant_id = $2
        ) AS allowed
        `,
        [projectId, tenantId],
      );
      return result.rows[0]?.allowed ?? false;
    }

    const result = await this.query<{ allowed: boolean } & QueryResultRow>(
      `
      SELECT EXISTS (
        SELECT 1
        FROM projects p
        INNER JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1
        WHERE p.id = $2 AND p.tenant_id = $3
      ) AS allowed
      `,
      [userId, projectId, tenantId],
    );
    return result.rows[0]?.allowed ?? false;
  }

  async isProjectMember(userId: string, projectId: string): Promise<boolean> {
    const result = await this.query<{ allowed: boolean } & QueryResultRow>(
      `
      SELECT EXISTS (
        SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2
      ) AS allowed
      `,
      [projectId, userId],
    );
    return result.rows[0]?.allowed ?? false;
  }

  async userInTenant(userId: string, tenantId: string): Promise<boolean> {
    const result = await this.query<{ allowed: boolean } & QueryResultRow>(
      `
      SELECT EXISTS (
        SELECT 1 FROM users WHERE id = $1 AND tenant_id = $2
      ) AS allowed
      `,
      [userId, tenantId],
    );
    return result.rows[0]?.allowed ?? false;
  }

  async create(input: {
    name: string;
    description: string | null;
    tenantId: string;
    creatorId: string;
  }): Promise<ProjectRow> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      const projectResult = await client.query<ProjectRowResult>(
        `
        INSERT INTO projects (name, description, tenant_id, status)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, description, tenant_id, status, created_at
        `,
        [input.name, input.description, input.tenantId, ProjectStatus.Active],
      );
      const row = projectResult.rows[0];
      if (!row) {
        throw new Error("Failed to create project");
      }

      await client.query(
        `
        INSERT INTO project_members (project_id, user_id)
        VALUES ($1, $2)
        `,
        [row.id, input.creatorId],
      );

      await client.query("COMMIT");
      return row;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async updateById(
    projectId: string,
    input: {
      name?: string;
      description?: string | null;
      status?: ProjectStatus;
    },
  ): Promise<ProjectRow | null> {
    const hasName = input.name !== undefined;
    const hasDescription = input.description !== undefined;
    const hasStatus = input.status !== undefined;

    if (!hasName && !hasDescription && !hasStatus) {
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
        END,
        status = COALESCE($5, status)
      WHERE id = $1
      RETURNING id, name, description, tenant_id, status, created_at
      `,
      [
        projectId,
        hasName ? input.name : null,
        hasDescription,
        input.description ?? null,
        hasStatus ? input.status : null,
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

  async addMember(projectId: string, userId: string): Promise<void> {
    await this.query(
      `
      INSERT INTO project_members (project_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (project_id, user_id) DO NOTHING
      `,
      [projectId, userId],
    );
  }

  async removeMember(projectId: string, userId: string): Promise<boolean> {
    const result = await this.query<{ id: string } & QueryResultRow>(
      `
      DELETE FROM project_members
      WHERE project_id = $1 AND user_id = $2
      RETURNING id
      `,
      [projectId, userId],
    );
    return Boolean(result.rows[0]?.id);
  }

  async listMembers(projectId: string): Promise<
    Array<{
      user_id: string;
      name: string;
      email: string;
      role: UserRole;
      joined_at: Date;
    }>
  > {
    const result = await this.query<
      {
        user_id: string;
        name: string;
        email: string;
        role: UserRole;
        joined_at: Date;
      } & QueryResultRow
    >(
      `
      SELECT u.id AS user_id, u.name, u.email, u.role, pm.joined_at
      FROM project_members pm
      INNER JOIN users u ON u.id = pm.user_id
      WHERE pm.project_id = $1
      ORDER BY pm.joined_at ASC
      `,
      [projectId],
    );
    return result.rows;
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
