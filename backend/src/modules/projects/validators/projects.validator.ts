import { z } from "zod";

import { ProjectStatus } from "../../../shared/constants/projects";

export const createProjectBodySchema = z.object({
  name: z.string().min(1, "name is required"),
  description: z.string().nullable().optional(),
});

export const updateProjectBodySchema = z
  .object({
    name: z.string().min(1, "name must be a non-empty string").optional(),
    description: z.string().nullable().optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.description !== undefined ||
      value.status !== undefined,
    {
      message: "at least one of name, description, or status is required",
    },
  );

export const addProjectMemberBodySchema = z.object({
  user_id: z.string().uuid("user_id must be a valid uuid"),
});

export type CreateProjectBody = z.infer<typeof createProjectBodySchema>;
export type UpdateProjectBody = z.infer<typeof updateProjectBodySchema>;
export type AddProjectMemberBody = z.infer<typeof addProjectMemberBodySchema>;

