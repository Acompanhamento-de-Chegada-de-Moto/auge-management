import z from "zod/v3";

export const clientSchema = z.object({
  cpf: z.string().min(11).max(14),
  customerName: z.string().min(1),
  sellerName: z.string().min(1),
  city: z.string().min(1),
  billingDate: z.string().optional(),
  chassis: z.string().optional(),
  model: z.string().optional(),
  forecastDate: z.string().optional(),
  registrationStatus: z
    .enum(["Sem Emplacamento", "Emplacando", "Emplacado"])
    .optional(),
  plateDate: z.string().optional(),
})

export type ClientSchemaType = z.infer<typeof clientSchema>;