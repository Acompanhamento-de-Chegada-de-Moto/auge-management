import { z } from "zod";

export const operatorSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome.").max(100),
});
export const pinLoginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Informe seu nome.")
    .max(100),
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
export const qrChassisSchema = z
  .string()
  .trim()
  .max(4096)
  .transform((value, ctx) => {
    if (!value.startsWith("{")) return { chassi: value };
    try {
      return JSON.parse(value) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "QR code inválido." });
      return z.NEVER;
    }
  })
  .pipe(chassisSchema);
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
