import { unstable_cache } from "next/cache";
import { stripCPF } from "@/lib/cpf";
import { arrivalArrivedWhere } from "@/lib/data/arrival-status";
import { listingCacheTags } from "@/lib/data/listing-cache-tags";
import { prisma } from "@/lib/db";

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
      updatedAt: "desc",
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
      billingDate: true,
    },
  });
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      motorcycles: {
        orderBy: { createdAt: "asc" },
      },
    },
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
      updatedAt: "desc",
    },
  });
}

const getCachedBDCFilterOptions = unstable_cache(
  async () => {
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
      sellers: sellers.map((seller) => seller.sellersName),
      cities: cities.map((city) => city.city),
      models: models.map((model) => model.model),
    };
  },
  ["bdc-filter-options"],
  { revalidate: 300, tags: [listingCacheTags.bdcFilters] },
);

const getCachedBDCStatusCounts = unstable_cache(
  async () => {
    const arrivedFilter = { motorcycles: { some: arrivalArrivedWhere() } };
    const [total, arrived, waiting] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: arrivedFilter }),
      prisma.client.count({ where: { NOT: arrivedFilter } }),
    ]);

    return { total, arrived, waiting };
  },
  ["bdc-status-counts"],
  { revalidate: 60, tags: [listingCacheTags.bdcCounts] },
);

export function getBDCFilterOptions() {
  return getCachedBDCFilterOptions();
}

export function getBDCStatusCounts() {
  return getCachedBDCStatusCounts();
}
export async function getClientsPaginated(params: {
  page: number;
  pageSize: number;
  sellerName?: string;
  city?: string;
  model?: string;
  search?: string;
  arrived?: "true" | "false";
}) {
  const where: Record<string, unknown> = {};

  if (params.sellerName) {
    where.sellersName = { contains: params.sellerName, mode: "insensitive" };
  }
  if (params.city) {
    where.city = { contains: params.city, mode: "insensitive" };
  }

  let motorcycleFilter: Record<string, unknown> | undefined;

  if (params.model) {
    motorcycleFilter = {
      model: { contains: params.model, mode: "insensitive" },
    };
  }

  if (params.arrived === "true") {
    const chegou = arrivalArrivedWhere();
    motorcycleFilter = motorcycleFilter
      ? { AND: [motorcycleFilter, chegou] }
      : chegou;
  }

  if (motorcycleFilter) {
    where.motorcycles = { some: motorcycleFilter };
  }

  if (params.arrived === "false") {
    where.NOT = {
      motorcycles: {
        some: arrivalArrivedWhere(),
      },
    };
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { cpf: { contains: params.search } },
      {
        motorcycles: {
          some: { chassi: { contains: params.search, mode: "insensitive" } },
        },
      },
    ];
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
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
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
      updatedAt: "desc",
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

export async function getPublicClientByCpf(cpf: string) {
  return prisma.client.findUnique({
    where: { cpf },
    select: {
      id: true,
      name: true,
      cpf: true,
      city: true,
      sellersName: true,
      billingDate: true,
      createdAt: true,
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
        orderBy: { createdAt: "desc" },
      },
    },
  });
}
