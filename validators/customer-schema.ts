import * as z from "zod";

export const customerSchema = z
  .object({
    chassi: z.string().min(1, "Chassi é obrigatório"),
    cliente: z.string().min(1, "Cliente é obrigatório"),
    vendedor: z.string().min(1, "Vendedor é obrigatório"),
    cidade: z.string().min(1, "Cidade é obrigatória"),
    modelo: z.string().min(1, "Modelo é obrigatório"),
    dataFaturamento: z.date().optional(),
    motoChegou: z.boolean(),
    dataChegada: z.date().optional(),
    statusRegistro: z.enum(["Pendente", "Em Registro", "Registrado"]),
    dataRegistro: z.date().optional(),
  })
  .refine(
    (data) => {
      if (data.statusRegistro !== "Pendente" && !data.dataRegistro) {
        return false;
      }
      return true;
    },
    {
      message: "Data do registro é obrigatória quando o status não é Pendente",
      path: ["dataRegistro"],
    },
  );

export type CustomerFormData = z.infer<typeof customerSchema>;
