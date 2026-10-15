import { z } from "zod";
import { normalizeDocument, validateDocument } from "@/lib/document";

export const documentSearchSchema = z.object({
  document: z
    .string()
    .trim()
    .max(18)
    .refine(validateDocument, "Informe um CPF ou CNPJ válido.")
    .transform(normalizeDocument),
});
