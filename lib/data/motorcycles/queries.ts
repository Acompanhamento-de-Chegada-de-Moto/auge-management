import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { businessDate, withArrivalStatus } from "@/lib/arrival";
import {
  arrivalArrivedWhere,
  arrivalDelayedWhere,
  arrivalInTransitWhere,
} from "@/lib/data/arrival-status";
import { listingCacheTags } from "@/lib/data/listing-cache-tags";
import { prisma } from "@/lib/db";

async function getCachedEstoqueFilterOptions() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300, expire: 3000 });
  cacheTag(listingCacheTags.inventoryFilters);
  const models = await prisma.motorcycle.findMany({
    select: { model: true },
    distinct: ["model"],
    where: { model: { not: "" } },
    orderBy: { model: "asc" },
  });

  return { models: models.map((motorcycle) => motorcycle.model) };
}

async function getCachedMotorcycleStatusCounts(_businessDay: string) {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 600 });
  cacheTag(listingCacheTags.inventoryCounts);
  const [total, inTransit, arrived, delayed] = await Promise.all([
    prisma.motorcycle.count(),
    prisma.motorcycle.count({
      where: arrivalInTransitWhere(),
    }),
    prisma.motorcycle.count({ where: arrivalArrivedWhere() }),
    prisma.motorcycle.count({ where: arrivalDelayedWhere() }),
  ]);

  return { total, inTransit, arrived, delayed };
}

export function getEstoqueFilterOptions() {
  return getCachedEstoqueFilterOptions();
}

export function getMotorcycleStatusCounts() {
  return getCachedMotorcycleStatusCounts(businessDate());
}
export async function getMotorcyclesPaginated(params: {
  page: number;
  pageSize: number;
  model?: string;
  status?: "in-transit" | "arrived" | "delayed";
  chassisSearch?: string;
  arrived?: "true" | "false";
}) {
  const where: Prisma.MotorcycleWhereInput = {};

  if (params.model) {
    where.model = params.model;
  }

  const andConditions: Prisma.MotorcycleWhereInput[] = [];

  if (params.status) {
    switch (params.status) {
      case "in-transit":
        andConditions.push(arrivalInTransitWhere());
        break;
      case "arrived":
        andConditions.push(arrivalArrivedWhere());
        break;
      case "delayed":
        andConditions.push(arrivalDelayedWhere());
        break;
    }
  }

  if (params.arrived === "true") {
    andConditions.push(arrivalArrivedWhere());
  } else if (params.arrived === "false") {
    andConditions.push({
      NOT: arrivalArrivedWhere(),
    });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  if (params.chassisSearch) {
    where.chassi = { contains: params.chassisSearch, mode: "insensitive" };
  }

  const [data, total] = await Promise.all([
    prisma.motorcycle.findMany({
      where,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      select: {
        id: true,
        chassi: true,
        model: true,
        forecastArrival: true,
        forecastArrivalStatus: true,
        arrivedAt: true,
        registrationStatus: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.motorcycle.count({ where }),
  ]);

  return {
    motorcycles: data.map(withArrivalStatus),
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
  };
}

export async function getMotorcycleByIdWithClient(id: string) {
  const motorcycle = await prisma.motorcycle.findUnique({
    where: { id },
    include: {
      client: true,
    },
  });
  return motorcycle ? withArrivalStatus(motorcycle) : null;
}

export async function getPublicMotorcycleById(id: string) {
  const motorcycle = await prisma.motorcycle.findFirst({
    where: { id },
    select: {
      id: true,
      chassi: true,
      clientId: true,
      forecastArrival: true,
      forecastArrivalStatus: true,
      arrivedAt: true,
      model: true,
      registrationStatus: true,
      client: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return motorcycle ? withArrivalStatus(motorcycle) : null;
}

export async function getMotorcycleLookupByChassis(chassis: string) {
  const motorcycle = await prisma.motorcycle.findFirst({
    where: { chassi: chassis },
    select: {
      model: true,
      forecastArrival: true,
      forecastArrivalStatus: true,
      arrivedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return motorcycle ? withArrivalStatus(motorcycle) : null;
}
