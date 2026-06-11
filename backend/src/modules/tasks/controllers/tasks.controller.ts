import type { NextFunction, Request, Response } from "express";

import ResponseFormatter from "../../../shared/utils/responseFormatter";
import { AppError } from "../../../shared/utils/AppError";
import { TaskStatus } from "../../../shared/constants/tasks";
import type { TasksService } from "../services/tasks.service";
import type { CreateTaskBody, UpdateTaskBody } from "../validators/tasks.validator";

function parseStatus(value: unknown): TaskStatus | undefined {
  if (typeof value !== "string") return undefined;
  if (value === TaskStatus.Todo) return TaskStatus.Todo;
  if (value === TaskStatus.InProgress) return TaskStatus.InProgress;
  if (value === TaskStatus.Done) return TaskStatus.Done;
  return undefined;
}

function parseUuid(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    return undefined;
  }
  return value;
}

export class TasksController {
  constructor(private readonly tasksService: TasksService) {
    if (!tasksService) throw new Error("TasksService is required");
  }

  async listByProject(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = String(req.params.id);
      const status = req.query.status;
      const assignee = req.query.assignee;

      const fields: Record<string, string> = {};
      const parsedStatus = status != null ? parseStatus(status) : undefined;
      if (status != null && parsedStatus === undefined) {
        fields.status = `must be one of: ${Object.values(TaskStatus).join(", ")}`;
      }

      const parsedAssignee = assignee != null ? parseUuid(assignee) : undefined;
      if (assignee != null && parsedAssignee === undefined) {
        fields.assignee = "must be a valid uuid";
      }

      if (Object.keys(fields).length > 0) {
        throw new AppError("validation failed", 400, fields);
      }

      const tasks = await this.tasksService.listProjectTasks(projectId, {
        status: parsedStatus,
        assigneeId: parsedAssignee,
      });
      res.status(200).json(ResponseFormatter.success(tasks, "Tasks fetched"));
    } catch (error) {
      next(error);
    }
  }

  async createForProject(req: Request, res: Response, next: NextFunction) {
    try {
      const actorUserId = req.user?.userId;
      if (!actorUserId) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const projectId = String(req.params.id);
      const body = req.body as CreateTaskBody;

      const task = await this.tasksService.createTask({
        projectId,
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        assigneeId: body.assignee_id,
        dueDate: body.due_date,
        createdBy: actorUserId,
      });

      res
        .status(201)
        .json(ResponseFormatter.success(task, "Task created", 201));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const taskId = String(req.params.id);
      const body = req.body as UpdateTaskBody;

      const task = await this.tasksService.updateTask({
        taskId,
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        assigneeId: body.assignee_id,
        dueDate: body.due_date,
      });

      res.status(200).json(ResponseFormatter.success(task, "Task updated"));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const actorUserId = req.user?.userId;
      if (!actorUserId) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const taskId = String(req.params.id);
      await this.tasksService.deleteTask(taskId, actorUserId);
      res.status(200).json(ResponseFormatter.success(null, "Task deleted"));
    } catch (error) {
      next(error);
    }
  }
}

