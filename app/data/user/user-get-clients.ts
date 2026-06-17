import { prisma } from "@/lib/db";
import { requireAuth } from "./require-auth";

export async function userGetClients() {
  await requireAuth();

  const data = await prisma.client.findMany({
    select: {
      id: true,
      cpf: true,
      name: true,
      sellerName: true,
      city: true,
      billingDate: true,
      motorcycles: {
        select: {
          id: true,
          chassis: true,
          model: true,
          forecastDate: true,
          registrationStatus: true,
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
