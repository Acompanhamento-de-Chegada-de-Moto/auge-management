import { prisma } from "@/lib/db";

type RegistrationStatus = "NO_PLATE" | "PLATING" | "PLATED";

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

export interface MotorcycleImportRow {
  chassis: string;
  model: string;
  date: Date | null;
}

export interface MotorcycleImportCounts {
  created: number;
  updated: number;
  skipped: number;
}

export async function importMotorcycleSpreadsheet(
  rows: MotorcycleImportRow[],
): Promise<MotorcycleImportCounts> {
  const counts: MotorcycleImportCounts = { created: 0, updated: 0, skipped: 0 };

  await prisma.$transaction(
    async (tx) => {
      const existingMotorcycles = await tx.motorcycle.findMany({
        select: { id: true, chassi: true, model: true, forecastArrival: true },
      });
      const byChassis = new Map(
        existingMotorcycles.map((motorcycle) => [
          motorcycle.chassi.trim().toUpperCase(),
          motorcycle,
        ]),
      );
      const processed = new Set<string>();

      for (const row of rows) {
        const chassis = row.chassis.trim().toUpperCase();
        const model = row.model.trim();
        if (!chassis || processed.has(chassis)) {
          counts.skipped++;
          continue;
        }

        const existing = byChassis.get(chassis);
        if (!existing) {
          const created = await tx.motorcycle.create({
            data: { chassi: chassis, model, forecastArrival: row.date },
            select: {
              id: true,
              chassi: true,
              model: true,
              forecastArrival: true,
            },
          });
          byChassis.set(chassis, created);
          counts.created++;
        } else {
          const shouldUpdate =
            (row.date && !existing.forecastArrival) ||
            (row.date &&
              existing.forecastArrival?.getTime() !== row.date.getTime()) ||
            (model && existing.model !== model);

          if (shouldUpdate) {
            const updated = await tx.motorcycle.update({
              where: { id: existing.id },
              data: {
                model: model || existing.model,
                forecastArrival: row.date ?? existing.forecastArrival,
              },
              select: {
                id: true,
                chassi: true,
                model: true,
                forecastArrival: true,
              },
            });
            byChassis.set(chassis, updated);
            counts.updated++;
          } else {
            counts.skipped++;
          }
        }
        processed.add(chassis);
      }
    },
    { maxWait: 10_000, timeout: 120_000 },
  );

  return counts;
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

export async function updateMotorcycleSafely(
  id: string,
  data: {
    chassi: string;
    model: string;
    forecastArrival?: Date | null;
    forecastArrivalStatus?: "NO_INFORMATION" | "ARRIVED" | "DELAYED";
  },
): Promise<string | null> {
  return prisma.$transaction(async (tx) => {
    const current = await tx.motorcycle.findUnique({
      where: { id },
      select: { id: true, chassi: true },
    });
    if (!current) return "Motocicleta não encontrada.";

    if (data.chassi !== current.chassi) {
      const duplicate = await tx.motorcycle.findUnique({
        where: { chassi: data.chassi },
        select: { id: true },
      });
      if (duplicate)
        return "Este chassi já está cadastrado em outra motocicleta.";
    }

    await tx.motorcycle.update({
      where: { id },
      data: {
        chassi: data.chassi,
        model: data.model,
        forecastArrival: data.forecastArrival ?? null,
        forecastArrivalStatus: data.forecastArrivalStatus ?? "NO_INFORMATION",
      },
    });
    return null;
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
  return prisma.motorcycle.deleteMany({ where: { id } });
}

export async function linkMotorcycleToClient(chassi: string, clientId: string) {
  return prisma.motorcycle.update({
    where: { chassi },
    data: { clientId },
  });
}
