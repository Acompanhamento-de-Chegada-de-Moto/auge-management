import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Insira um e-mail válido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

export type SignUpInputType = z.infer<typeof signUpSchema>;
