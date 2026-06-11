import { z } from "zod";

import { TaskPriority, TaskStatus } from "../../../shared/constants/tasks";

const PG_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const createTaskBodySchema = z.object({
  title: z.string().min(1, "title is required"),
  description: z.string().nullable().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assignee_id: z
    .string()
    .regex(PG_UUID_PATTERN, "Invalid UUID")
    .nullable()
    .optional(),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "due_date must be YYYY-MM-DD")
    .nullable()
    .optional(),
});

export const updateTaskBodySchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    assignee_id: z
      .string()
      .regex(PG_UUID_PATTERN, "Invalid UUID")
      .nullable()
      .optional(),
    due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "due_date must be YYYY-MM-DD")
      .nullable()
      .optional(),
  })
  .refine(
    (value) =>
      Object.keys(value).some(
        (k) => (value as Record<string, unknown>)[k] !== undefined,
      ),
    { message: "at least one field must be provided" },
  );

export type CreateTaskBody = z.infer<typeof createTaskBodySchema>;
export type UpdateTaskBody = z.infer<typeof updateTaskBodySchema>;

