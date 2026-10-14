import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { withArrivalStatus } from "@/lib/arrival";
import { stripCPF } from "@/lib/cpf";
import { arrivalArrivedWhere } from "@/lib/data/arrival-status";
import { listingCacheTags } from "@/lib/data/listing-cache-tags";
import { prisma } from "@/lib/db";

export async function getClientById(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      motorcycles: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
  return client
    ? { ...client, motorcycles: client.motorcycles.map(withArrivalStatus) }
    : null;
}

async function getCachedBDCFilterOptions() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300, expire: 3000 });
  cacheTag(listingCacheTags.bdcFilters);
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
}

async function getCachedBDCStatusCounts() {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 600 });
  cacheTag(listingCacheTags.bdcCounts);
  const arrivedFilter = { motorcycles: { some: arrivalArrivedWhere() } };
  const [total, arrived, waiting] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: arrivedFilter }),
    prisma.client.count({ where: { NOT: arrivedFilter } }),
  ]);

  return { total, arrived, waiting };
}

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
    const search = params.search.trim();
    const cpfSearch =
      /^[\d.\s-]+$/.test(search) && stripCPF(search)
        ? stripCPF(search)
        : search;
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { cpf: { contains: cpfSearch } },
      {
        motorcycles: {
          some: { chassi: { contains: search, mode: "insensitive" } },
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
            arrivedAt: true,
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
    clients: data.map((client) => ({
      ...client,
      motorcycles: client.motorcycles.map(withArrivalStatus),
    })),
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
  };
}

export async function searchClients(query: string) {
  const stripped = stripCPF(query);
  if (!stripped) return [];

  const clients = await prisma.client.findMany({
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
          arrivedAt: true,
          registrationStatus: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 500,
  });
  return clients.map((client) => ({
    ...client,
    motorcycles: client.motorcycles.map(withArrivalStatus),
  }));
}
