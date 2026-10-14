import "server-only";

import { prisma } from "@/lib/db";
import { normalizeDocument } from "@/lib/document";

export async function createClient(data: {
  document: string;
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
      document: normalizeDocument(data.document),
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
    document?: string;
    name?: string;
    sellerName?: string;
    city?: string;
    billingDate?: Date | null;
  },
) {
  return prisma.client.update({
    where: { id },
    data: {
      document: data.document ? normalizeDocument(data.document) : undefined,
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
  return prisma.client.deleteMany({
    where: { id },
  });
}
