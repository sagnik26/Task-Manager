import type { NextFunction, Request, Response } from "express";

import ResponseFormatter from "../../../shared/utils/responseFormatter";
import type { ProjectsService } from "../services/projects.service";
import type {
  AddProjectMemberBody,
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

  private readAccessContext(req: Request) {
    const userId = req.user?.userId;
    const tenantId = req.user?.tenantId;
    const role = req.user?.role;
    if (!userId || !tenantId || !role) {
      return null;
    }
    return { userId, tenantId, role };
  }

  async listProjects(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const ctx = this.readAccessContext(req);
      if (!ctx) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const projects = await this.projectsService.listProjects(ctx);
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
      const ctx = this.readAccessContext(req);
      if (!ctx) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const { name, description } = req.body as CreateProjectBody;

      const project = await this.projectsService.createProject(ctx, {
        name,
        description: description ?? null,
        tenantId: ctx.tenantId,
        creatorId: ctx.userId,
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
      const ctx = this.readAccessContext(req);
      if (!ctx) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const projectId = this.readParamId(req.params.id);
      const detail = await this.projectsService.getProjectDetail(ctx, projectId);
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
      const ctx = this.readAccessContext(req);
      if (!ctx) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const projectId = this.readParamId(req.params.id);
      const stats = await this.projectsService.getProjectStats(ctx, projectId);
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
      const ctx = this.readAccessContext(req);
      if (!ctx) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const projectId = this.readParamId(req.params.id);
      const { name, description, status } = req.body as UpdateProjectBody;

      const project = await this.projectsService.updateProject(ctx, projectId, {
        name,
        description,
        status,
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
      const ctx = this.readAccessContext(req);
      if (!ctx) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const projectId = this.readParamId(req.params.id);
      await this.projectsService.deleteProject(ctx, projectId);
      res.status(200).json(ResponseFormatter.success(null, "Project deleted"));
    } catch (error) {
      next(error);
    }
  }

  async addProjectMember(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const ctx = this.readAccessContext(req);
      if (!ctx) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const projectId = this.readParamId(req.params.id);
      const { user_id: userId } = req.body as AddProjectMemberBody;

      await this.projectsService.addProjectMember(ctx, projectId, userId);
      res
        .status(201)
        .json(ResponseFormatter.success(null, "Project member added", 201));
    } catch (error) {
      next(error);
    }
  }

  async listProjectMembers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const ctx = this.readAccessContext(req);
      if (!ctx) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const projectId = this.readParamId(req.params.id);
      const members = await this.projectsService.listProjectMembers(
        ctx,
        projectId,
      );
      res
        .status(200)
        .json(ResponseFormatter.success(members, "Project members fetched"));
    } catch (error) {
      next(error);
    }
  }

  async removeProjectMember(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const ctx = this.readAccessContext(req);
      if (!ctx) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const projectId = this.readParamId(req.params.id);
      const userId = this.readParamId(req.params.userId);

      await this.projectsService.removeProjectMember(ctx, projectId, userId);
      res
        .status(200)
        .json(ResponseFormatter.success(null, "Project member removed"));
    } catch (error) {
      next(error);
    }
  }
}
