import logger from "../../../shared/config/logger";
import { TaskStatus } from "../../../shared/constants/tasks";
import { AppError } from "../../../shared/utils/AppError";
import { ProjectsRepository } from "../repositories/projects.repository";
import type {
  CreateProjectInput,
  Project,
  ProjectDetail,
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
      ownerId: row.owner_id,
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

  async listProjects(userId: string): Promise<Project[]> {
    const rows = await this.projectsRepository.listForUser(userId);
    return rows.map((r) => this.toProject(r));
  }

  /**
   * Tasks module helper: ensure project exists and return owner id.
   * Note: does not perform access checks beyond existence.
   */
  async getProjectOrThrow(
    projectId: string,
  ): Promise<{ id: string; ownerId: string }> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new AppError("not found", 404);
    }
    return { id: project.id, ownerId: project.owner_id };
  }

  async createProject(input: CreateProjectInput): Promise<Project> {
    const name = input.name.trim();
    const description =
      input.description == null ? null : String(input.description).trim();

    const row = await this.projectsRepository.create({
      name,
      description,
      ownerId: input.ownerId,
    });

    logger.info("Project created", {
      projectId: row.id,
      ownerId: row.owner_id,
    });
    return this.toProject(row);
  }

  async getProjectDetail(
    userId: string,
    projectId: string,
  ): Promise<ProjectDetail> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new AppError("not found", 404);
    }

    const allowed = await this.projectsRepository.canUserAccessProject(
      userId,
      projectId,
    );
    if (!allowed) {
      throw new AppError("forbidden", 403);
    }

    const tasks = await this.projectsRepository.listTasksForProject(projectId);

    return {
      ...this.toProject(project),
      tasks: tasks.map((t) => this.toTask(t)),
    };
  }

  async getProjectStats(
    userId: string,
    projectId: string,
  ): Promise<ProjectTaskStats> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new AppError("not found", 404);
    }

    const allowed = await this.projectsRepository.canUserAccessProject(
      userId,
      projectId,
    );
    if (!allowed) {
      throw new AppError("forbidden", 403);
    }

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

    logger.info("Project stats fetched", { projectId, userId });

    return { byStatus, byAssignee };
  }

  async updateProject(
    userId: string,
    projectId: string,
    input: UpdateProjectInput,
  ): Promise<Project> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new AppError("not found", 404);
    }
    if (project.owner_id !== userId) {
      throw new AppError("forbidden", 403);
    }

    const row = await this.projectsRepository.updateById(projectId, {
      name: input.name != null ? input.name.trim() : undefined,
      description:
        input.description !== undefined
          ? input.description == null
            ? null
            : String(input.description).trim()
          : undefined,
    });

    if (!row) {
      throw new AppError("not found", 404);
    }

    logger.info("Project updated", { projectId, ownerId: userId });
    return this.toProject(row);
  }

  async deleteProject(userId: string, projectId: string): Promise<void> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new AppError("not found", 404);
    }
    if (project.owner_id !== userId) {
      throw new AppError("forbidden", 403);
    }

    const deleted = await this.projectsRepository.deleteById(projectId);
    if (!deleted) {
      throw new AppError("not found", 404);
    }

    logger.info("Project deleted", { projectId, ownerId: userId });
  }
}
