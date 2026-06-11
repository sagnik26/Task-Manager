import type { NextFunction, Request, Response } from "express";

import logger from "../config/logger";

/**
 * Request logger middleware — logs method, path, status, and duration when the response finishes.
 */
const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("HTTP request completed", {
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      duration,
      ip: req.ip || req.socket.remoteAddress,
    });
  });

  next();
};

export default requestLogger;
