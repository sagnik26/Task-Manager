import type { NextFunction, Request, Response } from "express";

import ResponseFormatter from "../../../shared/utils/responseFormatter";
import type { ProjectsService } from "../services/projects.service";
import type {
  CreateProjectBody,
  UpdateProjectBody,
} from "../validators/projects.validator";

export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {
    if (!projectsService) {
      throw new Error("ProjectsService is required");
    }
  }

  private readParamId(value: unknown): string {
    if (Array.isArray(value)) {
      return value[0] ?? "";
    }
    return typeof value === "string" ? value : "";
  }

  async listProjects(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const projects = await this.projectsService.listProjects(userId);
      res
        .status(200)
        .json(ResponseFormatter.success(projects, "Projects fetched"));
    } catch (error) {
      next(error);
    }
  }

  async createProject(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const { name, description } = req.body as CreateProjectBody;

      const project = await this.projectsService.createProject({
        name,
        description: description ?? null,
        ownerId: userId,
      });

      res
        .status(201)
        .json(ResponseFormatter.success(project, "Project created", 201));
    } catch (error) {
      next(error);
    }
  }

  async getProjectDetail(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const projectId = this.readParamId(req.params.id);
      const detail = await this.projectsService.getProjectDetail(userId, projectId);
      res.status(200).json(ResponseFormatter.success(detail, "Project fetched"));
    } catch (error) {
      next(error);
    }
  }

  async getProjectStats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const projectId = this.readParamId(req.params.id);
      const stats = await this.projectsService.getProjectStats(userId, projectId);
      res.status(200).json(ResponseFormatter.success(stats, "Project stats fetched"));
    } catch (error) {
      next(error);
    }
  }

  async updateProject(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const projectId = this.readParamId(req.params.id);
      const { name, description } = req.body as UpdateProjectBody;

      const project = await this.projectsService.updateProject(userId, projectId, {
        name,
        description,
      });

      res.status(200).json(ResponseFormatter.success(project, "Project updated"));
    } catch (error) {
      next(error);
    }
  }

  async deleteProject(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const projectId = this.readParamId(req.params.id);
      await this.projectsService.deleteProject(userId, projectId);
      res.status(200).json(ResponseFormatter.success(null, "Project deleted"));
    } catch (error) {
      next(error);
    }
  }
}

