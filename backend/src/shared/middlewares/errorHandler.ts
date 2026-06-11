import type { ErrorRequestHandler } from "express";

import logger from "../config/logger";
import { AppError } from "../utils/AppError";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  logger.error("Error occurred", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    if (err.statusCode === 400 && err.errors != null) {
      res.status(400).json({
        error: "validation failed",
        fields: err.errors,
      });
      return;
    }

    if (err.statusCode === 401) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    if (err.statusCode === 403) {
      res.status(403).json({ error: "forbidden" });
      return;
    }

    if (err.statusCode === 404) {
      res.status(404).json({ error: "not found" });
      return;
    }

    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: "internal server error" });
};

export default errorHandler;
