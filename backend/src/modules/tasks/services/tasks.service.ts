import { AppError } from "../../../shared/utils/AppError";
import type { ProjectsService } from "../../projects/services/projects.service";
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
  ): Promise<Task[]> {
    await this.projectsService.getProjectOrThrow(projectId);
    const tasks = await this.tasksRepository.listByProjectId(projectId, filters);
    return tasks.map(mapTask);
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    await this.projectsService.getProjectOrThrow(input.projectId);
    const row = await this.tasksRepository.create(input);
    return mapTask(row);
  }

  async updateTask(input: UpdateTaskInput): Promise<Task> {
    const updated = await this.tasksRepository.update(input);
    if (!updated) throw new AppError("not found", 404);
    return mapTask(updated);
  }

  async deleteTask(taskId: string, actorUserId: string): Promise<void> {
    const task = await this.tasksRepository.findById(taskId);
    if (!task) throw new AppError("not found", 404);

    const project = await this.projectsService.getProjectOrThrow(task.project_id);

    const isOwner = project.ownerId === actorUserId;
    const isCreator = task.created_by === actorUserId;
    if (!isOwner && !isCreator) {
      throw new AppError("forbidden", 403);
    }

    const ok = await this.tasksRepository.deleteById(taskId);
    if (!ok) throw new AppError("not found", 404);
  }
}

