import { z } from "zod";

export const operatorSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome.").max(100),
  identifier: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9._-]{3,40}$/,
      "Use de 3 a 40 letras, números, ponto, hífen ou sublinhado.",
    ),
});
export const pinLoginSchema = z.object({
  identifier: operatorSchema.shape.identifier,
  pin: z.string().regex(/^\d{8}$/, "Informe o PIN de 8 dígitos."),
});
export const chassisSchema = z.object({
  chassi: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z0-9]{1,17}$/,
      "Informe um chassi válido, com até 17 letras ou números.",
    ),
});
export const confirmationSchema = z.object({
  motorcycleId: z.string().uuid(),
  chassi: chassisSchema.shape.chassi,
  source: z.enum(["MANUAL", "QR_CODE"]),
});
export type CheckInMotorcycle = {
  id: string;
  chassi: string;
  model: string;
  forecastArrival: string | null;
  forecastArrivalStatus: string;
  arrivedAt: string | null;
};
