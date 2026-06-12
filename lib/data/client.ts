import { stripCPF } from "@/lib/cpf";
import { prisma } from "@/lib/db";

export async function createClient(data: {
  cpf: string;
  name: string;
  sellerName: string;
  city: string;
  billingDate?: Date;
  motorcycles?: Array<{
    chassis: string;
    model: string;
    forecastDate?: Date | null;
    registrationStatus?: "NO_PLATE" | "PLATING" | "PLATED";
    registrationStatusDate?: Date | null;
  }>;
}) {
  return prisma.client.create({
    data: {
      cpf: stripCPF(data.cpf),
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
}

export async function getAllClientsForImport() {
  return prisma.client.findMany({
    select: {
      id: true,
      cpf: true,
      name: true,
      sellerName: true,
    },
  });
}

export async function createClientsBatch(
  clients: Array<{
    cpf?: string;
    name: string;
    sellerName: string;
    city: string;
    billingDate?: Date | null;
  }>,
) {
  if (clients.length === 0) return [];
  let index = 0;
  return prisma.client.createManyAndReturn({
    data: clients.map((c) => {
      const cpf = c.cpf ? stripCPF(c.cpf) : `TEMP-${index.toString().padStart(11, "0")}`;
      index++;
      return {
        cpf,
        name: c.name,
        sellerName: c.sellerName,
        city: c.city,
        billingDate: c.billingDate ?? null,
      };
    }),
    select: {
      id: true,
      cpf: true,
      name: true,
      sellerName: true,
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
  const stripped = stripCPF(query);
  if (!stripped) return [];

  return prisma.client.findMany({
    where: {
      cpf: { contains: stripped },
    },
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

export async function getClientByCpf(cpf: string) {
  return prisma.client.findUnique({
    where: { cpf },
    include: {
      motorcycles: true,
    },
  });
}
