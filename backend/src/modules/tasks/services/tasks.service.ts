import { AppError } from "../../../shared/utils/AppError";
import type { ProjectsService } from "../../projects/services/projects.service";
import type { ProjectAccessContext } from "../../projects/types/projects.types";
import type { Task, TaskRow } from "../types/tasks.types";
import type {
  CreateTaskInput,
  ListProjectTasksFilters,
  UpdateTaskInput,
} from "../types/tasks.types";
import type { TasksRepository } from "../repositories/tasks.repository";

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    projectId: row.project_id,
    assigneeId: row.assignee_id,
    createdBy: row.created_by,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly projectsService: ProjectsService,
  ) {
    if (!tasksRepository) throw new Error("TasksRepository is required");
    if (!projectsService) throw new Error("ProjectsService is required");
  }

  async listProjectTasks(
    projectId: string,
    filters: ListProjectTasksFilters,
    ctx: ProjectAccessContext,
  ): Promise<Task[]> {
    await this.projectsService.assertProjectAccess(ctx, projectId);
    const tasks = await this.tasksRepository.listByProjectId(projectId, filters);
    return tasks.map(mapTask);
  }

  async createTask(
    input: CreateTaskInput,
    ctx: ProjectAccessContext,
  ): Promise<Task> {
    await this.projectsService.assertProjectAccess(ctx, input.projectId);
    const row = await this.tasksRepository.create(input);
    return mapTask(row);
  }

  async updateTask(
    input: UpdateTaskInput,
    ctx: ProjectAccessContext,
  ): Promise<Task> {
    const existing = await this.tasksRepository.findById(input.taskId);
    if (!existing) throw new AppError("not found", 404);

    await this.projectsService.assertProjectAccess(ctx, existing.project_id);

    const updated = await this.tasksRepository.update(input);
    if (!updated) throw new AppError("not found", 404);
    return mapTask(updated);
  }

  async deleteTask(
    taskId: string,
    ctx: ProjectAccessContext,
  ): Promise<void> {
    const task = await this.tasksRepository.findById(taskId);
    if (!task) throw new AppError("not found", 404);

    const canDelete = await this.projectsService.canUserDeleteTask(
      ctx,
      task.project_id,
      task.created_by,
    );
    if (!canDelete) {
      throw new AppError("forbidden", 403);
    }

    const ok = await this.tasksRepository.deleteById(taskId);
    if (!ok) throw new AppError("not found", 404);
  }
}
