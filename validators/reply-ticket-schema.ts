import { z } from "zod";

export const replyTicketSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Mensagem não pode estar vazia")
    .max(2000, "A mensagem deve ter no máximo 2.000 caracteres"),
});

export type ReplyTicketInput = z.infer<typeof replyTicketSchema>;
