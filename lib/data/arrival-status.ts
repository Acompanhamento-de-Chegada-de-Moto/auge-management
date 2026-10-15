import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { forecastCutoff } from "@/lib/arrival";

export function arrivalInTransitWhere(): Prisma.MotorcycleWhereInput {
  return {
    AND: [
      { NOT: arrivalArrivedWhere() },
      {
        OR: [
          { forecastArrival: null },
          { forecastArrival: { gte: forecastCutoff() } },
        ],
      },
    ],
  };
}

export function arrivalArrivedWhere(): Prisma.MotorcycleWhereInput {
  return {
    OR: [{ forecastArrivalStatus: "ARRIVED" }, { arrivedAt: { not: null } }],
  };
}

export function arrivalDelayedWhere(): Prisma.MotorcycleWhereInput {
  return {
    AND: [
      { NOT: arrivalArrivedWhere() },
      { forecastArrival: { lt: forecastCutoff() } },
    ],
  };
}
