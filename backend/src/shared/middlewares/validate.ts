import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type AnyZodSchema = ZodType<unknown>;

function isZodSchema(schema: unknown): schema is AnyZodSchema {
  return (
    typeof schema === "object" &&
    schema !== null &&
    "safeParse" in schema &&
    typeof (schema as { safeParse?: unknown }).safeParse === "function"
  );
}

const validate =
  (schema: AnyZodSchema | null | undefined) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!schema) {
      next();
      return;
    }

    if (!isZodSchema(schema)) {
      res.status(500).json({ error: "internal server error" });
      return;
    }

    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".") || "body";
        fields[key] = issue.message;
      }
      res.status(400).json({ error: "validation failed", fields });
      return;
    }

    req.body = result.data as unknown;
    next();
  };

export default validate;
