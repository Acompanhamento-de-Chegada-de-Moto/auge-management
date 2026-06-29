"use server";
import "server-only";

import { prisma } from "@/lib/db";

export async function publicGetMotorcycleById(id: string) {
  const data = await prisma.motorcycle.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      chassi: true,
      clientId: true,
      forecastArrival: true,
      forecastArrivalStatus: true,
      model: true,
      registrationStatus: true,
      client: true,
      createdAt: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return data;
}

export type PublicGetMotorcycleByIdType = Awaited<
  ReturnType<typeof publicGetMotorcycleById>
>;
