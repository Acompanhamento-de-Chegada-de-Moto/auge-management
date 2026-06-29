import { z } from "zod/v3";

export const ArrivalStatusEnum = z.nativeEnum({
  DELAYED: "DELAYED",
  ARRIVED: "ARRIVED",
  NO_INFORMATION: "NO_INFORMATION",
});

export const RegistrationStatusEnum = z.nativeEnum({
  NO_PLATE: "NO_PLATE",
  PLATING: "PLATING",
  PLATED: "PLATED",
});

export const createMotorcycleSchema = z.object({
  chassi: z
    .string()
    .min(1, "O chassi é obrigatório.")
    .max(17, "O chassi deve ter no máximo 17 caracteres."),

  model: z
    .string()
    .min(1, "O modelo é obrigatório.")
    .max(100, "Nome do modelo longo demais."),

  forecastArrival: z
    .date()
    .optional()
    .nullable()
    .or(z.string().transform((val) => (val ? new Date(val) : null))),

  forecastArrivalStatus: ArrivalStatusEnum.default("NO_INFORMATION"),
  registrationStatus: RegistrationStatusEnum.optional().nullable(),
  registrationDate: z.date().optional().nullable(),

  clientId: z.string().uuid("ID de cliente inválido.").optional().nullable(),
});

export type CreateMotorcycleType = z.infer<typeof createMotorcycleSchema>;
