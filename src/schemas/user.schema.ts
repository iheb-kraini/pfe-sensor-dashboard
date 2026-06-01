import { z } from "zod";

export const createUserSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be at most 32 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
      "Must contain uppercase, lowercase, number and special character",
    ),
  role: z.enum(["admin", "user"]).optional(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be at most 32 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
      "Must contain uppercase, lowercase, number and special character",
    ),
});

export type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;
