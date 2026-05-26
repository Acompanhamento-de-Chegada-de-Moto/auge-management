import { prisma } from "@/lib/db";

export async function createClient(data: {
  name: string;
  sellerName: string;
  city: string;
  billingDate?: Date;
  motorcycles?: Array<{
    chassis: string;
    model: string;
    arrivalDate?: Date | null;
    registrationStatus?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    registrationStatusDate?: Date | null;
  }>;
}) {
  return prisma.client.create({
    data: {
      name: data.name,
      sellerName: data.sellerName,
      city: data.city,
      billingDate: data.billingDate,
      motorcycles: data.motorcycles ? { create: data.motorcycles } : undefined,
    },
    include: {
      motorcycles: true,
    },
  });
}

export async function getClients() {
  return prisma.client.findMany({
    include: {
      motorcycles: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      motorcycles: true,
    },
  });
}

export async function updateClient(
  id: string,
  data: {
    name?: string;
    sellerName?: string;
    city?: string;
    billingDate?: Date | null;
  },
) {
  return prisma.client.update({
    where: { id },
    data: {
      name: data.name,
      sellerName: data.sellerName,
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

export async function searchClientsByName(name: string) {
  return prisma.client.findMany({
    where: {
      name: {
        contains: name,
        mode: "insensitive",
      },
    },
    include: {
      motorcycles: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function searchClients(query: string) {
  return prisma.client.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        {
          motorcycles: {
            some: { chassis: { contains: query, mode: "insensitive" } },
          },
        },
      ],
    },
    include: {
      motorcycles: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getClientByNameAndSeller(
  name: string,
  sellerName: string,
) {
  return prisma.client.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
      sellerName: {
        equals: sellerName,
        mode: "insensitive",
      },
    },
    include: {
      motorcycles: true,
    },
  });
}
