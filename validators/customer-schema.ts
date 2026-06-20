import * as z from "zod";
import { validateCPF } from "@/lib/cpf";

export const customerSchema = z
  .object({
    chassis: z.string().min(1, "Chassi é obrigatório"),
    cpf: z
      .string()
      .min(11, "CPF deve ter no mínimo 11 dígitos")
      .max(14, "CPF inválido")
      .refine((val) => validateCPF(val), {
        message: "CPF inválido",
      }),
    customerName: z.string().min(1, "Cliente é obrigatório"),
    sellerName: z.string().min(1, "Vendedor é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    model: z.string().min(1, "Modelo é obrigatório"),
    billingDate: z.date().optional(),
    forecastDate: z.date().optional(),
    registrationStatus: z.enum(["Sem Emplacamento", "Emplacando", "Emplacado"]),
    registrationDate: z.date().optional(),
    newChassis: z.string().optional(),
    newModel: z.string().optional(),
    newForecastDate: z.date().optional(),
  })
  .refine(
    (data) => {
      if (
        data.registrationStatus !== "Sem Emplacamento" &&
        !data.registrationDate
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "Data do emplacamento é obrigatória quando o status não é Sem Emplacamento",
      path: ["registrationDate"],
    },
  )
  .refine(
    (data) => {
      if (data.newChassis && !data.newModel) return false;
      return true;
    },
    {
      message: "Modelo é obrigatório quando um novo chassi é informado",
      path: ["newModel"],
    },
  );

export type CustomerFormData = z.infer<typeof customerSchema>;
