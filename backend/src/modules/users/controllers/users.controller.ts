import type { NextFunction, Request, Response } from "express";

import ResponseFormatter from "../../../shared/utils/responseFormatter";
import type { UsersService } from "../services/users.service";
import type { UpdateUserBody } from "../validators/users.validator";

export class UsersController {
  constructor(private readonly usersService: UsersService) {
    if (!usersService) {
      throw new Error("UsersService is required");
    }
  }

  private readParamId(value: unknown): string {
    if (Array.isArray(value)) {
      return value[0] ?? "";
    }
    return typeof value === "string" ? value : "";
  }

  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const users = await this.usersService.listUsers(tenantId);
      res.status(200).json(ResponseFormatter.success(users, "Users fetched"));
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const actorUserId = req.user?.userId;
      if (!tenantId || !actorUserId) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const userId = this.readParamId(req.params.id);
      const body = req.body as UpdateUserBody;

      const user = await this.usersService.updateUser(
        tenantId,
        userId,
        {
          role: body.role,
          isActive: body.is_active,
        },
        actorUserId,
      );

      res.status(200).json(ResponseFormatter.success(user, "User updated"));
    } catch (error) {
      next(error);
    }
  }
}
