"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "./require-auth";

export async function userGetMotorcycles() {
  await requireAuth();

  const data = await prisma.motorcycle.findMany({
    select: {
      id: true,
      chassi: true,
      model: true,
      forecastArrival: true,
      forecastArrivalStatus: true,
      registrationStatus: true,
      client: {
        select: {
          id: true,
          name: true,
          cpf: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return data;
}

export type UserGetMotorcyclesType = Awaited<
  ReturnType<typeof userGetMotorcycles>
>[0];
