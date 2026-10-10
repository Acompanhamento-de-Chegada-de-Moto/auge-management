import "server-only";

import { stripCPF } from "@/lib/cpf";
import { prisma } from "@/lib/db";

export async function createClient(data: {
  cpf: string;
  name: string;
  sellerName: string;
  city: string;
  billingDate?: Date | null;
  motorcycles?: Array<{
    chassi: string;
    model: string;
    forecastArrival?: Date | null;
    forecastArrivalStatus?: "NO_INFORMATION" | "ARRIVED" | "DELAYED";
    registrationStatus?: "NO_PLATE" | "PLATING" | "PLATED";
  }>;
}) {
  return prisma.client.create({
    data: {
      cpf: stripCPF(data.cpf),
      name: data.name,
      sellersName: data.sellerName,
      city: data.city,
      billingDate: data.billingDate ?? null,
      motorcycles: data.motorcycles ? { create: data.motorcycles } : undefined,
    },
    include: {
      motorcycles: true,
    },
  });
}

export async function updateClient(
  id: string,
  data: {
    cpf?: string;
    name?: string;
    sellerName?: string;
    city?: string;
    billingDate?: Date | null;
  },
) {
  return prisma.client.update({
    where: { id },
    data: {
      cpf: data.cpf ? stripCPF(data.cpf) : undefined,
      name: data.name,
      sellersName: data.sellerName,
      city: data.city,
      billingDate: data.billingDate,
    },
    include: {
      motorcycles: true,
    },
  });
}

export async function deleteClient(id: string) {
  return prisma.client.delete({
    where: { id },
  });
}
