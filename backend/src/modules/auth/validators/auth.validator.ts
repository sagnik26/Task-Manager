import { z } from "zod";

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerBodySchema = z.object({
  name: z.string().min(1, "name is required"),
  email: z.string().regex(EMAIL_PATTERN, "invalid email format"),
  password: z.string().min(1, "password is required"),
});

export const loginBodySchema = z.object({
  email: z.string().regex(EMAIL_PATTERN, "invalid email format"),
  password: z.string().min(1, "password is required"),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
