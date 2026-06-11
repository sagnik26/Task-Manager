import { z } from "zod";

const ISO_DATE_YYYY_MM_DD = /^\d{4}-\d{2}-\d{2}$/;

export const taskUpsertSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().trim().max(5000, "Description is too long").optional(),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  assigneeId: z.string().uuid().nullable(),
  dueDate: z
    .string()
    .regex(ISO_DATE_YYYY_MM_DD, "Due date must be YYYY-MM-DD")
    .nullable(),
});

export type TaskUpsertValues = z.infer<typeof taskUpsertSchema>;

