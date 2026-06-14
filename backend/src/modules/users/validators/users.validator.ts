import { z } from "zod";

import { UserRole } from "../../../shared/constants/users";

export const updateUserBodySchema = z
  .object({
    role: z.nativeEnum(UserRole).optional(),
    is_active: z.boolean().optional(),
  })
  .refine((value) => value.role !== undefined || value.is_active !== undefined, {
    message: "at least one of role or is_active is required",
  });

export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
