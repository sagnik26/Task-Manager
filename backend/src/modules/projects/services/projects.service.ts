import logger from "../../../shared/config/logger";
import { UserRole } from "../../../shared/constants/users";
import { TaskStatus } from "../../../shared/constants/tasks";
import { AppError } from "../../../shared/utils/AppError";
import { ProjectsRepository } from "../repositories/projects.repository";
import type {
  CreateProjectInput,
  Project,
  ProjectAccessContext,
  ProjectDetail,
  ProjectMember,
  ProjectTaskStats,
  ProjectRow,
  TaskRow,
  UpdateProjectInput,
} from "../types/projects.types";

export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {
    if (!projectsRepository) {
      throw new Error("ProjectsRepository is required");
    }
  }

  private toProject(row: ProjectRow): Project {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      tenantId: row.tenant_id,
      status: row.status,
      createdAt: row.created_at,
    };
  }

  private toTask(row: TaskRow): ProjectDetail["tasks"][number] {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      assigneeId: row.assignee_id,
      createdBy: row.created_by,
      dueDate: row.due_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private async assertProjectInTenant(
    projectId: string,
    tenantId: string,
  ): Promise<ProjectRow> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new AppError("not found", 404);
    }
    if (project.tenant_id !== tenantId) {
      throw new AppError("forbidden", 403);
    }
    return project;
  }

  async assertProjectAccess(
    ctx: ProjectAccessContext,
    projectId: string,
  ): Promise<ProjectRow> {
    const project = await this.assertProjectInTenant(projectId, ctx.tenantId);
    const allowed = await this.projectsRepository.canUserAccessProject(
      ctx.userId,
      ctx.tenantId,
      ctx.role,
      projectId,
    );
    if (!allowed) {
      throw new AppError("forbidden", 403);
    }
    return project;
  }

  async listProjects(ctx: ProjectAccessContext): Promise<Project[]> {
    const rows = await this.projectsRepository.listForUser(
      ctx.userId,
      ctx.tenantId,
      ctx.role,
    );
    return rows.map((r) => this.toProject(r));
  }

  async createProject(
    ctx: ProjectAccessContext,
    input: CreateProjectInput,
  ): Promise<Project> {
    const name = input.name.trim();
    const description =
      input.description == null ? null : String(input.description).trim();

    const row = await this.projectsRepository.create({
      name,
      description,
      tenantId: ctx.tenantId,
      creatorId: ctx.userId,
    });

    logger.info("Project created", {
      projectId: row.id,
      tenantId: row.tenant_id,
      creatorId: ctx.userId,
    });
    return this.toProject(row);
  }

  async getProjectDetail(
    ctx: ProjectAccessContext,
    projectId: string,
  ): Promise<ProjectDetail> {
    const project = await this.assertProjectAccess(ctx, projectId);
    const tasks = await this.projectsRepository.listTasksForProject(projectId);

    return {
      ...this.toProject(project),
      tasks: tasks.map((t) => this.toTask(t)),
    };
  }

  async getProjectStats(
    ctx: ProjectAccessContext,
    projectId: string,
  ): Promise<ProjectTaskStats> {
    await this.assertProjectAccess(ctx, projectId);

    const [statusRows, assigneeRows] = await Promise.all([
      this.projectsRepository.countTasksByStatusForProject(projectId),
      this.projectsRepository.countTasksByAssigneeForProject(projectId),
    ]);

    const byStatus: ProjectTaskStats["byStatus"] = {
      [TaskStatus.Todo]: 0,
      [TaskStatus.InProgress]: 0,
      [TaskStatus.Done]: 0,
    };

    for (const row of statusRows) {
      if (row.status in byStatus) {
        byStatus[row.status] = row.count;
      }
    }

    const byAssignee = assigneeRows.map((row) => ({
      assigneeId: row.assignee_id,
      count: row.count,
    }));

    logger.info("Project stats fetched", { projectId, userId: ctx.userId });

    return { byStatus, byAssignee };
  }

  async updateProject(
    ctx: ProjectAccessContext,
    projectId: string,
    input: UpdateProjectInput,
  ): Promise<Project> {
    await this.assertProjectAccess(ctx, projectId);

    if (ctx.role !== UserRole.Admin) {
      const isMember = await this.projectsRepository.isProjectMember(
        ctx.userId,
        projectId,
      );
      if (!isMember) {
        throw new AppError("forbidden", 403);
      }
    }

    const row = await this.projectsRepository.updateById(projectId, {
      name: input.name != null ? input.name.trim() : undefined,
      description:
        input.description !== undefined
          ? input.description == null
            ? null
            : String(input.description).trim()
          : undefined,
      status: input.status,
    });

    if (!row) {
      throw new AppError("not found", 404);
    }

    logger.info("Project updated", { projectId, userId: ctx.userId });
    return this.toProject(row);
  }

  async deleteProject(
    ctx: ProjectAccessContext,
    projectId: string,
  ): Promise<void> {
    await this.assertProjectInTenant(projectId, ctx.tenantId);

    const deleted = await this.projectsRepository.deleteById(projectId);
    if (!deleted) {
      throw new AppError("not found", 404);
    }

    logger.info("Project deleted", { projectId, userId: ctx.userId });
  }

  async addProjectMember(
    ctx: ProjectAccessContext,
    projectId: string,
    userId: string,
  ): Promise<void> {
    await this.assertProjectInTenant(projectId, ctx.tenantId);

    const userInTenant = await this.projectsRepository.userInTenant(
      userId,
      ctx.tenantId,
    );
    if (!userInTenant) {
      throw new AppError("user not in tenant", 404);
    }

    await this.projectsRepository.addMember(projectId, userId);
    logger.info("Project member added", { projectId, userId, adminId: ctx.userId });
  }

  async listProjectMembers(
    ctx: ProjectAccessContext,
    projectId: string,
  ): Promise<ProjectMember[]> {
    await this.assertProjectAccess(ctx, projectId);

    const rows = await this.projectsRepository.listMembers(projectId);
    return rows.map((row) => ({
      userId: row.user_id,
      name: row.name,
      email: row.email,
      role: row.role,
      joinedAt: row.joined_at,
    }));
  }

  async removeProjectMember(
    ctx: ProjectAccessContext,
    projectId: string,
    userId: string,
  ): Promise<void> {
    await this.assertProjectInTenant(projectId, ctx.tenantId);

    const removed = await this.projectsRepository.removeMember(
      projectId,
      userId,
    );
    if (!removed) {
      throw new AppError("not found", 404);
    }

    logger.info("Project member removed", {
      projectId,
      userId,
      adminId: ctx.userId,
    });
  }

  async canUserDeleteTask(
    ctx: ProjectAccessContext,
    projectId: string,
    createdBy: string,
  ): Promise<boolean> {
    if (ctx.role === UserRole.Admin) {
      return this.projectsRepository.canUserAccessProject(
        ctx.userId,
        ctx.tenantId,
        ctx.role,
        projectId,
      );
    }

    if (createdBy !== ctx.userId) {
      return false;
    }

    return this.projectsRepository.isProjectMember(ctx.userId, projectId);
  }
}
