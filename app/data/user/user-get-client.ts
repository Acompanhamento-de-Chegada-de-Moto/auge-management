import "server-only";

import { prisma } from "@/lib/db";
import { requireAuth } from "./require-auth";

export async function userGetClient(id: string) {
  await requireAuth();

  const data = await prisma.client.findFirst({
    where: {
      id: id,
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
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return data;
}

export type UserGetClientType = Awaited<ReturnType<typeof userGetClient>>;
