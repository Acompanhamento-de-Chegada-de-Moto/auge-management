import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { forecastCutoff } from "@/lib/arrival";

export async function recordStaffArrival(
  tx: Prisma.TransactionClient,
  motorcycleId: string,
  received: boolean,
  actorLabel: string,
) {
  const now = new Date();
  if (received) {
    const result = await tx.motorcycle.updateMany({
      where: {
        id: motorcycleId,
        arrivedAt: null,
        forecastArrivalStatus: { not: "ARRIVED" },
      },
      data: { arrivedAt: now, forecastArrivalStatus: "ARRIVED" },
    });
    if (result.count)
      await tx.motorcycleReceipt.create({
        data: { motorcycleId, actorLabel, source: "STAFF", arrivedAt: now },
      });
  }
  // Do not overwrite a concurrent check-in or its first receipt timestamp.
  await tx.$executeRaw`
    UPDATE motorcycles SET "forecastArrivalStatus" = CASE
      WHEN "forecastArrival" < ${forecastCutoff(now)} THEN 'DELAYED'::"ArrivalStatus"
      ELSE 'NO_INFORMATION'::"ArrivalStatus" END
    WHERE id = ${motorcycleId}::uuid AND "arrivedAt" IS NULL AND "forecastArrivalStatus" <> 'ARRIVED'
  `;
}
