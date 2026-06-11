import type { AppErrorDetails } from "../types/errors";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors: AppErrorDetails;

  constructor(
    message: string,
    statusCode = 500,
    errors: AppErrorDetails = null,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
