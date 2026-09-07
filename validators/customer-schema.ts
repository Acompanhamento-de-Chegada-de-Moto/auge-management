import * as z from "zod";
import { stripCPF } from "@/lib/cpf";
import { validateDocument } from "@/lib/document";

export const customerSchema = z
  .object({
    chassis: z.string().min(1, "Chassi é obrigatório"),
    cpf: z
      .string()
      .min(11, "CPF ou CNPJ deve ter no mínimo 11 caracteres")
      .max(18, "CPF ou CNPJ inválido")
      .refine((val) => validateDocument(val), {
        message: "CPF ou CNPJ inválido",
      })
      .transform((val) => stripCPF(val)),
    customerName: z.string().min(1, "Cliente é obrigatório"),
    sellerName: z.string().min(1, "Vendedor é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    model: z.string().min(1, "Modelo é obrigatório"),
    billingDate: z.date().optional(),
    forecastDate: z.date().optional(),
    registrationStatus: z.enum(["Sem Emplacamento", "Emplacando", "Emplacado"]),
    registrationDate: z.date().optional(),
    arrivalStatus: z.enum(["Sem Informação", "Chegou", "Atrasada"]),
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
