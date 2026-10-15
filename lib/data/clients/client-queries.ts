import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { withArrivalStatus } from "@/lib/arrival";
import {
  arrivalArrivedWhere,
  arrivalDelayedWhere,
} from "@/lib/data/arrival-status";
import { listingCacheTags } from "@/lib/data/listing-cache-tags";
import { prisma } from "@/lib/db";
import { normalizeDocument, validateDocument } from "@/lib/document";
import { forecastDateBounds } from "@/lib/forecast-date-range";

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

interface BDCFilters {
  forecastFrom?: string;
  forecastTo?: string;
  sellerName?: string;
  city?: string;
  model?: string;
  search?: string;
  arrived?: "true" | "false" | "delayed";
}

function buildBDCFilters(params: BDCFilters) {
  const where: Prisma.ClientWhereInput = {};
  const motorcycleConditions: Prisma.MotorcycleWhereInput[] = [];
  const forecastArrival = forecastDateBounds(params);
  if (forecastArrival) motorcycleConditions.push({ forecastArrival });

  if (params.sellerName)
    where.sellersName = { equals: params.sellerName, mode: "insensitive" };
  if (params.city) where.city = { equals: params.city, mode: "insensitive" };
  if (params.model)
    motorcycleConditions.push({
      model: { equals: params.model, mode: "insensitive" },
    });
  if (params.arrived === "true")
    motorcycleConditions.push(arrivalArrivedWhere());
  if (params.arrived === "false")
    motorcycleConditions.push({ NOT: arrivalArrivedWhere() });
  if (params.arrived === "delayed")
    motorcycleConditions.push(arrivalDelayedWhere());

  const motorcycleFilter: Prisma.MotorcycleWhereInput | undefined =
    motorcycleConditions.length ? { AND: motorcycleConditions } : undefined;
  if (motorcycleFilter) where.motorcycles = { some: motorcycleFilter };

  const search = params.search?.trim();
  let visibleMotorcycles = motorcycleFilter;
  if (search) {
    const clientSearch: Prisma.ClientWhereInput[] = [
      { name: { contains: search, mode: "insensitive" } },
      {
        document: {
          contains: normalizeDocument(search) || search,
          mode: "insensitive",
        },
      },
    ];
    const chassisSearch: Prisma.MotorcycleWhereInput = {
      chassi: { contains: search, mode: "insensitive" },
    };
    where.OR = [
      ...clientSearch,
      {
        motorcycles: {
          some: motorcycleFilter
            ? { AND: [motorcycleFilter, chassisSearch] }
            : chassisSearch,
        },
      },
    ];
    // A name/document match keeps all matching motorcycles for that client;
    // a chassis-only match keeps just the matching motorcycle.
    visibleMotorcycles = {
      AND: [
        ...(motorcycleFilter ? [motorcycleFilter] : []),
        { OR: [{ client: { is: { OR: clientSearch } } }, chassisSearch] },
      ],
    };
  }
  return { where, visibleMotorcycles };
}

async function countBDCStatuses(params: BDCFilters) {
  const count = (arrived?: BDCFilters["arrived"]) =>
    prisma.client.count({
      where: buildBDCFilters({ ...params, arrived }).where,
    });
  const [total, arrived, waiting, delayed] = await Promise.all([
    count(),
    count("true"),
    count("false"),
    count("delayed"),
  ]);
  return { total, arrived, waiting, delayed };
}

async function getCachedBDCStatusCounts() {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 600 });
  cacheTag(listingCacheTags.bdcCounts);
  return countBDCStatuses({});
}

export function getBDCFilterOptions() {
  return getCachedBDCFilterOptions();
}

export function getBDCStatusCounts(params: BDCFilters = {}) {
  return params.sellerName ||
    params.forecastFrom ||
    params.forecastTo ||
    params.city ||
    params.model ||
    params.search?.trim()
    ? countBDCStatuses(params)
    : getCachedBDCStatusCounts();
}
export async function getClientsPaginated(
  params: BDCFilters & {
    page: number;
    pageSize: number;
  },
) {
  const { where, visibleMotorcycles } = buildBDCFilters(params);

  const [data, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      select: {
        id: true,
        document: true,
        name: true,
        sellersName: true,
        city: true,
        billingDate: true,
        motorcycles: {
          where: visibleMotorcycles,
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
  const stripped = normalizeDocument(query);
  if (!validateDocument(query)) return [];

  const clients = await prisma.client.findMany({
    where: {
      document: { equals: stripped, mode: "insensitive" },
    },
    select: {
      id: true,
      document: true,
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
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 1,
  });
  return clients.map((client) => ({
    ...client,
    motorcycles: client.motorcycles.map(withArrivalStatus),
  }));
}
