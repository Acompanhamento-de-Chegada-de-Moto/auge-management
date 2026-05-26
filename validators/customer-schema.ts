import * as z from "zod";

export const customerSchema = z
  .object({
    chassis: z.string().min(1, "Chassi é obrigatório"),
    customerName: z.string().min(1, "Cliente é obrigatório"),
    sellerName: z.string().min(1, "Vendedor é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    model: z.string().min(1, "Modelo é obrigatório"),
    billingDate: z.date().optional(),
    hasArrived: z.boolean(),
    arrivalDate: z.date().optional(),
    registrationStatus: z.enum(["Pendente", "Em Emplacamento", "Emplacado"]),
    plateDate: z.date().optional(),
  })
  .refine(
    (data) => {
      if (data.registrationStatus !== "Pendente" && !data.plateDate) {
        return false;
      }
      return true;
    },
    {
      message:
        "Data do emplacamento é obrigatória quando o status não é Pendente",
      path: ["plateDate"],
    },
  );

export type CustomerFormData = z.infer<typeof customerSchema>;
