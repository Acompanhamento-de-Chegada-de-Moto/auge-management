import * as z from "zod";
import {
  isLegacyDocument,
  normalizeDocument,
  validateDocument,
} from "@/lib/document";

export const customerSchema = z
  .object({
    chassis: z.string().min(1, "Chassi é obrigatório"),
    document: z
      .string()
      .trim()
      .min(1, "CPF ou CNPJ é obrigatório")
      .max(18, "CPF ou CNPJ inválido")
      .refine((val) => validateDocument(val), {
        message: "Informe um CPF ou CNPJ válido",
      })
      .transform((val) => normalizeDocument(val)),
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

export const editCustomerSchema = customerSchema.safeExtend({
  document: z
    .string()
    .trim()
    .max(45)
    .refine(
      (value) => validateDocument(value) || isLegacyDocument(value),
      "Informe um CPF ou CNPJ válido",
    )
    .transform((value) =>
      isLegacyDocument(value) ? value : normalizeDocument(value),
    ),
});
