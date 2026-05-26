import { prisma } from "@/lib/db";

type RegistrationStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

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

export async function createMotorcycle(data: {
  chassis: string;
  model: string;
  arrivalDate?: Date | null;
  registrationStatus?: RegistrationStatus;
  registrationStatusDate?: Date | null;
  clientId?: string;
}) {
  return prisma.motorcycle.create({
    data: {
      chassis: data.chassis,
      model: data.model,
      arrivalDate: data.arrivalDate,
      registrationStatus: data.registrationStatus ?? "PENDING",
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

export async function updateMotorcycle(
  id: string,
  data: {
    chassis?: string;
    model?: string;
    arrivalDate?: Date | null;
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
      arrivalDate: data.arrivalDate,
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
    arrivalDate?: Date | null;
    registrationStatus?: RegistrationStatus;
    registrationStatusDate?: Date | null;
    clientId?: string | null;
  },
) {
  return prisma.motorcycle.update({
    where: { chassis },
    data: {
      model: data.model,
      arrivalDate: data.arrivalDate,
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
