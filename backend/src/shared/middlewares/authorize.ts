import type { NextFunction, Request, Response } from "express";

import { can, type Permission } from "../permissions/permissions";

const authorize =
  (action: Permission) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    if (!can(req.user.role, action)) {
      res.status(403).json({
        error: "forbidden",
        message: `Requires permission: ${action}`,
      });
      return;
    }

    next();
  };

export default authorize;
