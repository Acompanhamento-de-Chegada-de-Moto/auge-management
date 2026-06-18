"use server";
import "server-only";

import { prisma } from "@/lib/db";
import { requireAuth } from "./require-auth";

export async function userGetMotorcycleById(id: string) {
  await requireAuth();

  const data = await prisma.motorcycle.findFirst({
    where: {
      id,
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

export type UserGetMotorcycleByIdType = Awaited<
  ReturnType<typeof userGetMotorcycleById>
>;
