import * as z from "zod";

export const motorcycleSchema = z.object({
  chassis: z.string().min(1, "Chassi é obrigatório"),
  model: z.string().min(1, "Modelo é obrigatório"),
  arrivalDate: z.date().optional(),
});

export type MotorcycleFormData = z.infer<typeof motorcycleSchema>;
