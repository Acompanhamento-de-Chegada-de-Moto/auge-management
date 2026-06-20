import { z } from "zod/v3";

export const clientSchema = z.object({
  cpf: z
    .string()
    .min(11, "CPF deve ter no mínimo 11 caracteres")
    .max(14, "CPF deve ter no máximo 14 caracteres")
    .transform((val) => val.replace(/[^\d]/g, "")),
  customerName: z.string().min(1, "Nome do cliente é obrigatório"),
  sellerName: z.string().min(1, "Nome do vendedor é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  chassis: z.string().min(1, "Chassi é obrigatório"),
  model: z.string().min(1, "Modelo é obrigatório"),
  billingDate: z.date().optional(),
  forecastDate: z.date().optional(),
  registrationStatus: z
    .enum(["Sem Emplacamento", "Emplacando", "Emplacado"])
    .optional(),
  registrationDate: z.date().optional(),
  arrivalStatus: z.enum(["Sem Informação", "Chegou", "Atrasada"]),
});

export type ClientSchemaType = z.infer<typeof clientSchema>;
