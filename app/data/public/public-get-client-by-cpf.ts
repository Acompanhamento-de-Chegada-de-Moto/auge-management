import "server-only";

import { prisma } from "@/lib/db";

export async function PublicGetClientByCPF(cpf: string) {
  const data = await prisma.client.findUnique({
    where: {
      cpf,
    },
    select: {
      id: true,
      name: true,
      cpf: true,
      city: true,
      sellersName: true,
      billingDate: true,
      createdAt: true,
      // Traz as motocicletas vinculadas a este cliente se houver
      motorcycles: {
        select: {
          id: true,
          chassi: true,
          model: true,
          forecastArrival: true,
          forecastArrivalStatus: true,
          registrationStatus: true,
          registrationDate: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return data;
}

export type PublicGetClientByCPFType = Awaited<
  ReturnType<typeof PublicGetClientByCPF>
>;
