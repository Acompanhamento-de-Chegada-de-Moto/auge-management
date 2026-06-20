"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "./require-auth";

export async function userGetMotorcycles(filters?: {
  model?: string;
  status?: "Em Trânsito" | "Chegou" | "Atrasada";
}) {
  await requireAuth();

  const where: Record<string, unknown> = {};

  if (filters?.model) {
    where.model = { contains: filters.model, mode: "insensitive" };
  }

  if (filters?.status) {
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);

    switch (filters.status) {
      case "Em Trânsito":
        where.OR = [
          { forecastArrival: null, forecastArrivalStatus: "NO_INFORMATION" },
          { forecastArrival: { gt: hoje }, forecastArrivalStatus: "NO_INFORMATION" },
        ];
        break;
      case "Chegou":
        where.OR = [
          { forecastArrivalStatus: "ARRIVED" },
          {
            forecastArrival: { lte: hoje },
            forecastArrivalStatus: "NO_INFORMATION",
          },
        ];
        break;
      case "Atrasada":
        where.OR = [
          { forecastArrivalStatus: "DELAYED" },
          {
            forecastArrival: { lt: hoje },
            forecastArrivalStatus: "NO_INFORMATION",
          },
        ];
        break;
    }
  }

  const data = await prisma.motorcycle.findMany({
    where,
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
