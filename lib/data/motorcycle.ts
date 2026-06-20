import { prisma } from "@/lib/db";

type RegistrationStatus = "NO_PLATE" | "PLATING" | "PLATED";

export async function getAllMotorcycles() {
  return prisma.motorcycle.findMany({
    select: {
      id: true,
      chassi: true,
      model: true,
      forecastArrival: true,
    },
    orderBy: {
      createdAt: "desc",
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
  status?: "Em Trânsito" | "Chegou" | "Atrasada";
  chassisSearch?: string;
}) {
  const where: Record<string, unknown> = {};

  if (params.model) {
    where.model = params.model;
  }

  if (params.status) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    switch (params.status) {
      case "Em Trânsito":
        where.OR = [
          { forecastArrival: null },
          { forecastArrival: { gte: amanha } },
        ];
        break;
      case "Chegou":
        where.forecastArrival = { gte: hoje, lt: amanha };
        break;
      case "Atrasada":
        where.forecastArrival = { lt: hoje };
        where.NOT = { forecastArrival: null };
        break;
    }
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
      },
      orderBy: { createdAt: "desc" },
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
  registrationStatus?: RegistrationStatus;
  registrationDate?: Date | null;
  clientId?: string;
}) {
  return prisma.motorcycle.create({
    data: {
      chassi: data.chassi,
      model: data.model,
      forecastArrival: data.forecastArrival,
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
