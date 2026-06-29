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

export async function getClients() {
  return prisma.client.findMany({
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
          forecastArrivalStatus: true,
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
      sellersName: true,
    },
  });
}

export async function createClientsBatch(
  clients: Array<{
    cpf?: string;
    name: string;
    sellerName: string;
    city: string;
  }>,
) {
  if (clients.length === 0) return [];
  let index = 0;
  return prisma.client.createManyAndReturn({
    data: clients.map((c) => {
      const cpf = c.cpf
        ? stripCPF(c.cpf)
        : `TEMP-${index.toString().padStart(11, "0")}`;
      index++;
      return {
        cpf,
        name: c.name,
        sellersName: c.sellerName,
        city: c.city,
      };
    }),
    select: {
      id: true,
      cpf: true,
      name: true,
      sellersName: true,
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

export async function getBDCFilterOptions() {
  const [sellers, cities, models] = await Promise.all([
    prisma.client.findMany({
      select: { sellersName: true },
      distinct: ["sellersName"],
      where: { sellersName: { not: "" } },
      orderBy: { sellersName: "asc" },
    }),
    prisma.client.findMany({
      select: { city: true },
      distinct: ["city"],
      where: { city: { not: "" } },
      orderBy: { city: "asc" },
    }),
    prisma.motorcycle.findMany({
      select: { model: true },
      distinct: ["model"],
      where: { model: { not: "" } },
      orderBy: { model: "asc" },
    }),
  ]);

  return {
    sellers: sellers.map((s) => s.sellersName),
    cities: cities.map((c) => c.city),
    models: models.map((m) => m.model),
  };
}

export async function getClientsPaginated(params: {
  page: number;
  pageSize: number;
  sellerName?: string;
  city?: string;
  model?: string;
  search?: string;
}) {
  const where: Record<string, unknown> = {};

  if (params.sellerName) {
    where.sellersName = { contains: params.sellerName, mode: "insensitive" };
  }
  if (params.city) {
    where.city = { contains: params.city, mode: "insensitive" };
  }
  if (params.model) {
    where.motorcycles = { some: { model: { contains: params.model, mode: "insensitive" } } };
  }
  if (params.search) {
    where.cpf = { contains: params.search };
  }

  const [data, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
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
            forecastArrivalStatus: true,
            registrationStatus: true,
            registrationDate: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.count({ where }),
  ]);

  return {
    clients: data,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
  };
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
      sellersName: true,
      city: true,
      billingDate: true,
      motorcycles: {
        select: {
          id: true,
          chassi: true,
          model: true,
          forecastArrival: true,
          forecastArrivalStatus: true,
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
      sellersName: {
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
