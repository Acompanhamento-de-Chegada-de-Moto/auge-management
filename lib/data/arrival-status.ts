import type { Prisma } from "@/generated/prisma/client";

export function arrivalInTransitWhere(): Prisma.MotorcycleWhereInput {
  return { forecastArrivalStatus: "NO_INFORMATION" };
}

export function arrivalArrivedWhere(): Prisma.MotorcycleWhereInput {
  return { forecastArrivalStatus: "ARRIVED" };
}

export function arrivalDelayedWhere(): Prisma.MotorcycleWhereInput {
  return { forecastArrivalStatus: "DELAYED" };
}
