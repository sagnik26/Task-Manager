import { z } from "zod";

export const createProjectBodySchema = z.object({
  name: z.string().min(1, "name is required"),
  description: z.string().nullable().optional(),
});

export const updateProjectBodySchema = z
  .object({
    name: z.string().min(1, "name must be a non-empty string").optional(),
    description: z.string().nullable().optional(),
  })
  .refine((value) => value.name !== undefined || value.description !== undefined, {
    message: "at least one of name or description is required",
  });

export type CreateProjectBody = z.infer<typeof createProjectBodySchema>;
export type UpdateProjectBody = z.infer<typeof updateProjectBodySchema>;

