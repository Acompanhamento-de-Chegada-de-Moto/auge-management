"use server";
import "server-only";

import { prisma } from "@/lib/db";
import { requireAuth } from "./require-auth";

export async function userGetMotorcycle(chassis: string) {
  await requireAuth();

  const data = await prisma.motorcycle.findFirst({
    where: {
      chassi: chassis,
    },
    select: {
      id: true,
      chassi: true,
      client: true,
      clientId: true,
      forecastArrival: true,
      model: true,
      registrationStatus: true,
      createdAt: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return data;
}

export type UserGetMotorcycleType = Awaited<
  ReturnType<typeof userGetMotorcycle>
>;
