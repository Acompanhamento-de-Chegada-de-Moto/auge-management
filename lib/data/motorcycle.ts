import { prisma } from "@/lib/db";

type RegistrationStatus = "NO_PLATE" | "PLATING" | "PLATED";

export async function getAllMotorcycles() {
  return prisma.motorcycle.findMany({
    select: {
      id: true,
      chassi: true,
      model: true,
      forecastArrival: true,
      forecastArrivalStatus: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 500,
  });
}

export async function getEstoqueFilterOptions() {
  const models = await prisma.motorcycle.findMany({
    select: { model: true },
    distinct: ["model"],
    where: { model: { not: "" } },
    orderBy: { model: "asc" },
  });

  return {
    models: models.map((m) => m.model),
  };
}

export async function getMotorcyclesPaginated(params: {
  page: number;
  pageSize: number;
  model?: string;
  chassisSearch?: string;
  arrived?: "true" | "false" | "em-transito";
}) {
  const where: Record<string, unknown> = {};

  if (params.model) {
    where.model = params.model;
  }

  const inicioHoje = new Date();
  inicioHoje.setHours(0, 0, 0, 0);
  const fimHoje = new Date();
  fimHoje.setHours(23, 59, 59, 999);

  const chegouCondition = {
    OR: [
      { forecastArrivalStatus: "ARRIVED" },
      {
        forecastArrival: { gte: inicioHoje, lte: fimHoje },
        forecastArrivalStatus: "NO_INFORMATION",
      },
    ],
  };

  const andConditions: Record<string, unknown>[] = [];

  if (params.arrived === "em-transito") {
    andConditions.push({
      OR: [
        { forecastArrival: null, forecastArrivalStatus: "NO_INFORMATION" },
        {
          forecastArrival: { gt: fimHoje },
          forecastArrivalStatus: "NO_INFORMATION",
        },
      ],
    });
  } else if (params.arrived === "true") {
    andConditions.push(chegouCondition);
  } else if (params.arrived === "false") {
    andConditions.push({ NOT: chegouCondition });
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
        registrationStatus: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.motorcycle.count({ where }),
  ]);

  return {
    motorcycles: data,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
  };
}

export async function getAllMotorcyclesForImport() {
  return prisma.motorcycle.findMany({
    select: {
      id: true,
      chassi: true,
      model: true,
      forecastArrival: true,
      clientId: true,
    },
  });
}

export async function createMotorcyclesBatch(
  motorcycles: Array<{
    chassi: string;
    model: string;
    forecastArrival?: Date | null;
    forecastArrivalStatus?: "NO_INFORMATION" | "ARRIVED" | "DELAYED";
    registrationStatus?: RegistrationStatus;
    clientId?: string;
  }>,
) {
  if (motorcycles.length === 0) return;
  return prisma.motorcycle.createMany({
    data: motorcycles.map((m) => ({
      chassi: m.chassi,
      model: m.model,
      forecastArrival: m.forecastArrival ?? null,
      forecastArrivalStatus: m.forecastArrivalStatus ?? "NO_INFORMATION",
      registrationStatus: m.registrationStatus ?? "NO_PLATE",
      clientId: m.clientId,
    })),
  });
}

export async function updateMotorcyclesBatch(
  updates: Array<{
    chassi: string;
    forecastArrival: Date;
  }>,
) {
  if (updates.length === 0) return;
  const operations = updates.map((u) =>
    prisma.motorcycle.update({
      where: { chassi: u.chassi },
      data: { forecastArrival: u.forecastArrival },
    }),
  );
  return prisma.$transaction(operations);
}

export async function updateMotorcyclesModelBatch(
  updates: Array<{
    chassi: string;
    model: string;
  }>,
) {
  if (updates.length === 0) return;
  const operations = updates.map((u) =>
    prisma.motorcycle.update({
      where: { chassi: u.chassi },
      data: { model: u.model },
    }),
  );
  return prisma.$transaction(operations);
}

export async function linkMotorcyclesBatch(
  links: Array<{ chassi: string; clientId: string }>,
) {
  if (links.length === 0) return;
  const operations = links.map((l) =>
    prisma.motorcycle.update({
      where: { chassi: l.chassi },
      data: { clientId: l.clientId },
    }),
  );
  return prisma.$transaction(operations);
}

export async function createMotorcycle(data: {
  chassi: string;
  model: string;
  forecastArrival?: Date | null;
  forecastArrivalStatus?: "NO_INFORMATION" | "ARRIVED" | "DELAYED";
  registrationStatus?: RegistrationStatus;
  registrationDate?: Date | null;
  clientId?: string;
}) {
  return prisma.motorcycle.create({
    data: {
      chassi: data.chassi,
      model: data.model,
      forecastArrival: data.forecastArrival,
      forecastArrivalStatus: data.forecastArrivalStatus ?? "NO_INFORMATION",
      registrationStatus: data.registrationStatus ?? "NO_PLATE",
      registrationDate: data.registrationDate ?? null,
      clientId: data.clientId,
    },
  });
}

export async function getMotorcycleByChassis(chassi: string) {
  return prisma.motorcycle.findUnique({
    where: { chassi },
  });
}

export async function getMotorcycleById(id: string) {
  return prisma.motorcycle.findUnique({
    where: { id },
  });
}

export async function getMotorcycleByIdWithClient(id: string) {
  return prisma.motorcycle.findUnique({
    where: { id },
    include: {
      client: true,
    },
  });
}

export async function updateMotorcycle(
  id: string,
  data: {
    chassi?: string;
    model?: string;
    forecastArrival?: Date | null;
    forecastArrivalStatus?: "NO_INFORMATION" | "ARRIVED" | "DELAYED";
    registrationStatus?: RegistrationStatus;
    registrationDate?: Date | null;
    clientId?: string | null;
  },
) {
  return prisma.motorcycle.update({
    where: { id },
    data: {
      chassi: data.chassi,
      model: data.model,
      forecastArrival: data.forecastArrival,
      forecastArrivalStatus: data.forecastArrivalStatus,
      registrationStatus: data.registrationStatus,
      registrationDate: data.registrationDate,
      clientId: data.clientId,
    },
  });
}

export async function updateMotorcycleByChassis(
  chassi: string,
  data: {
    model?: string;
    forecastArrival?: Date | null;
    forecastArrivalStatus?: "NO_INFORMATION" | "ARRIVED" | "DELAYED";
    registrationStatus?: RegistrationStatus;
    registrationDate?: Date | null;
    clientId?: string | null;
  },
) {
  return prisma.motorcycle.update({
    where: { chassi },
    data: {
      model: data.model,
      forecastArrival: data.forecastArrival,
      forecastArrivalStatus: data.forecastArrivalStatus,
      registrationStatus: data.registrationStatus,
      registrationDate: data.registrationDate,
      clientId: data.clientId,
    },
  });
}

export async function deleteMotorcycle(id: string) {
  return prisma.motorcycle.delete({
    where: { id },
  });
}

export async function linkMotorcycleToClient(chassi: string, clientId: string) {
  return prisma.motorcycle.update({
    where: { chassi },
    data: { clientId },
  });
}
