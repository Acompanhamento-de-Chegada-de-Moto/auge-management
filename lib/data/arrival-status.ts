import type { Prisma } from "@/generated/prisma/client";

function todayEndOfDay(): Date {
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  return hoje;
}

export function arrivalInTransitWhere(): Prisma.MotorcycleWhereInput {
  const hoje = todayEndOfDay();
  return {
    OR: [
      { forecastArrival: null, forecastArrivalStatus: "NO_INFORMATION" },
      {
        forecastArrival: { gt: hoje },
        forecastArrivalStatus: "NO_INFORMATION",
      },
    ],
  };
}

export function arrivalArrivedWhere(): Prisma.MotorcycleWhereInput {
  const hoje = todayEndOfDay();
  return {
    OR: [
      { forecastArrivalStatus: "ARRIVED" },
      {
        forecastArrival: { lte: hoje },
        forecastArrivalStatus: "NO_INFORMATION",
      },
    ],
  };
}

export function arrivalDelayedWhere(): Prisma.MotorcycleWhereInput {
  const hoje = todayEndOfDay();
  return {
    OR: [
      { forecastArrivalStatus: "DELAYED" },
      {
        forecastArrival: { lt: hoje },
        forecastArrivalStatus: "NO_INFORMATION",
      },
    ],
  };
}
