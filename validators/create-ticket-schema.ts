import * as z from "zod";

export const createTicketSchema = z.object({
  subject: z.string().min(1, "Assunto é obrigatório").max(200, "Assunto muito longo"),
  description: z.string().min(1, "Descrição é obrigatória").max(2000, "Descrição muito longa"),
  priority: z.enum(["NORMAL", "HIGH", "URGENT"]),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
