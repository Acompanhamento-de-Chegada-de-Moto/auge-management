import { prisma } from "@/lib/db";

type RegistrationStatus = "NO_PLATE" | "PLATING" | "PLATED";

export async function getAllMotorcycles() {
  return prisma.motorcycle.findMany({
    include: {
      client: {
        select: { name: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getAllMotorcyclesForImport() {
  return prisma.motorcycle.findMany({
    select: {
      id: true,
      chassis: true,
      forecastDate: true,
      clientId: true,
    },
  });
}

export async function createMotorcyclesBatch(
  motorcycles: Array<{
    chassis: string;
    model: string;
    forecastDate?: Date | null;
    registrationStatus?: RegistrationStatus;
    clientId?: string;
  }>,
) {
  if (motorcycles.length === 0) return;
  return prisma.motorcycle.createMany({
    data: motorcycles.map((m) => ({
      chassis: m.chassis,
      model: m.model,
      forecastDate: m.forecastDate ?? null,
      registrationStatus: m.registrationStatus ?? "NO_PLATE",
      clientId: m.clientId,
    })),
  });
}

export async function updateMotorcyclesBatch(
  updates: Array<{
    chassis: string;
    forecastDate: Date;
  }>,
) {
  if (updates.length === 0) return;
  const operations = updates.map((u) =>
    prisma.motorcycle.update({
      where: { chassis: u.chassis },
      data: { forecastDate: u.forecastDate },
    }),
  );
  return prisma.$transaction(operations);
}

export async function linkMotorcyclesBatch(
  links: Array<{ chassis: string; clientId: string }>,
) {
  if (links.length === 0) return;
  const operations = links.map((l) =>
    prisma.motorcycle.update({
      where: { chassis: l.chassis },
      data: { clientId: l.clientId },
    }),
  );
  return prisma.$transaction(operations);
}

export async function createMotorcycle(data: {
  chassis: string;
  model: string;
  forecastDate?: Date | null;
  registrationStatus?: RegistrationStatus;
  registrationStatusDate?: Date | null;
  clientId?: string;
}) {
  return prisma.motorcycle.create({
    data: {
      chassis: data.chassis,
      model: data.model,
      forecastDate: data.forecastDate,
      registrationStatus: data.registrationStatus ?? "NO_PLATE",
      registrationStatusDate: data.registrationStatusDate,
      clientId: data.clientId,
    },
  });
}

export async function getMotorcycleByChassis(chassis: string) {
  return prisma.motorcycle.findUnique({
    where: { chassis },
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
    chassis?: string;
    model?: string;
    forecastDate?: Date | null;
    registrationStatus?: RegistrationStatus;
    registrationStatusDate?: Date | null;
    clientId?: string | null;
  },
) {
  return prisma.motorcycle.update({
    where: { id },
    data: {
      chassis: data.chassis,
      model: data.model,
      forecastDate: data.forecastDate,
      registrationStatus: data.registrationStatus,
      registrationStatusDate: data.registrationStatusDate,
      clientId: data.clientId,
    },
  });
}

export async function updateMotorcycleByChassis(
  chassis: string,
  data: {
    model?: string;
    forecastDate?: Date | null;
    registrationStatus?: RegistrationStatus;
    registrationStatusDate?: Date | null;
    clientId?: string | null;
  },
) {
  return prisma.motorcycle.update({
    where: { chassis },
    data: {
      model: data.model,
      forecastDate: data.forecastDate,
      registrationStatus: data.registrationStatus,
      registrationStatusDate: data.registrationStatusDate,
      clientId: data.clientId,
    },
  });
}

export async function deleteMotorcycle(id: string) {
  return prisma.motorcycle.delete({
    where: { id },
  });
}

export async function linkMotorcycleToClient(
  chassis: string,
  clientId: string,
) {
  return prisma.motorcycle.update({
    where: { chassis },
    data: { clientId },
  });
}
