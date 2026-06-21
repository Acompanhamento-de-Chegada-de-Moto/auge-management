import { z } from "zod";

export const updateUserSchema = z.object({
  userId: z.string(),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  newPassword: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres")
    .optional()
    .or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
