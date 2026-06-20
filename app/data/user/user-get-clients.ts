import "server-only";

import { prisma } from "@/lib/db";
import { requireAuth } from "./require-auth";

interface UserGetClientsFilters {
  sellerName?: string;
  city?: string;
  model?: string;
}

export async function userGetClients(filters?: UserGetClientsFilters) {
  await requireAuth();

  const data = await prisma.client.findMany({
    where: {
      ...(filters?.sellerName && {
        sellersName: {
          contains: filters.sellerName,
          mode: "insensitive",
        },
      }),

      ...(filters?.city && {
        city: {
          contains: filters.city,
          mode: "insensitive",
        },
      }),

      ...(filters?.model && {
        motorcycles: {
          some: {
            model: {
              contains: filters.model,
              mode: "insensitive",
            },
          },
        },
      }),
    },

    select: {
      id: true,
      cpf: true,
      name: true,
      sellersName: true,
      city: true,
      billingDate: true,

      motorcycles: {
        select: {
          id: true,
          chassi: true,
          model: true,
          forecastArrival: true,
          registrationStatus: true,
          registrationDate: true,
          forecastArrivalStatus: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },

    take: 500,
  });

  return data;
}

export type UserGetClientsType = Awaited<ReturnType<typeof userGetClients>>[0];
