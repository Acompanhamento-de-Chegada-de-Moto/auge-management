import { prisma } from "@/lib/db";

type BDCArrivalStatus = "NO_INFORMATION" | "ARRIVED" | "DELAYED";
type BDCRegistrationStatus = "NO_PLATE" | "PLATING" | "PLATED";

export interface CreateBDCClientInput {
  cpf: string;
  name: string;
  sellerName: string;
  city: string;
  billingDate?: Date;
  motorcycle: {
    chassis: string;
    model: string;
    forecastDate?: Date;
    arrivalStatus: BDCArrivalStatus;
    arrivalStatusInput?: string;
    registrationStatus: BDCRegistrationStatus;
    registrationDate?: Date;
  };
}

export async function createBDCClient(input: CreateBDCClientInput) {
  return prisma.$transaction(async (tx) => {
    const existingClient = await tx.client.findUnique({
      where: { cpf: input.cpf },
    });
    let clientId = existingClient?.id;

    if (!clientId) {
      const client = await tx.client.create({
        data: {
          cpf: input.cpf,
          name: input.name,
          sellersName: input.sellerName,
          city: input.city,
          billingDate: input.billingDate ?? null,
        },
        select: { id: true },
      });
      clientId = client.id;
    }

    const existingMotorcycle = await tx.motorcycle.findUnique({
      where: { chassi: input.motorcycle.chassis },
    });

    if (existingMotorcycle) {
      if (
        existingMotorcycle.clientId &&
        existingMotorcycle.clientId !== clientId
      ) {
        throw new Error("Este chassi jÃ¡ estÃ¡ vinculado a outro cliente.");
      }

      await tx.motorcycle.update({
        where: { id: existingMotorcycle.id },
        data: {
          clientId,
          forecastArrivalStatus: resolveBDCArrivalStatus(
            input.motorcycle.arrivalStatus,
            input.motorcycle.arrivalStatusInput,
            existingMotorcycle.forecastArrivalStatus,
          ),
          registrationDate: input.motorcycle.registrationDate ?? null,
        },
      });
      return;
    }

    await tx.motorcycle.create({
      data: {
        chassi: input.motorcycle.chassis,
        model: input.motorcycle.model,
        forecastArrival: input.motorcycle.forecastDate ?? null,
        forecastArrivalStatus: input.motorcycle.arrivalStatus,
        registrationStatus: input.motorcycle.registrationStatus,
        registrationDate: input.motorcycle.registrationDate ?? null,
        clientId,
      },
    });
  });
}

function resolveBDCArrivalStatus(
  status: BDCArrivalStatus,
  submitted: string | undefined,
  current?: BDCArrivalStatus | null,
): BDCArrivalStatus {
  if (
    (!submitted || submitted === "Sem InformaÃ§Ã£o") &&
    current &&
    current !== "NO_INFORMATION"
  ) {
    return current;
  }
  return status;
}

export interface UpdateBDCClientInput
  extends Omit<CreateBDCClientInput, "motorcycle"> {
  clientId: string;
  motorcycleId: string | null;
  motorcycle: CreateBDCClientInput["motorcycle"] & { chassis: string };
  additionalMotorcycle?: {
    chassis: string;
    model: string;
    forecastDate?: Date;
  };
}

export async function updateBDCClient(input: UpdateBDCClientInput) {
  return prisma.$transaction(async (tx) => {
    const client = await tx.client.findUnique({
      where: { id: input.clientId },
      include: { motorcycles: true },
    });

    if (!client) return "Cliente nÃ£o encontrado.";

    const cpfExists = await tx.client.findFirst({
      where: { cpf: input.cpf, NOT: { id: input.clientId } },
      select: { id: true },
    });
    if (cpfExists) return "Este CPF jÃ¡ estÃ¡ cadastrado para outro cliente.";

    const currentMotorcycle = input.motorcycleId
      ? client.motorcycles.find((item) => item.id === input.motorcycleId)
      : client.motorcycles[0];

    if (input.motorcycleId && !currentMotorcycle) {
      return "Motocicleta nÃ£o encontrada para este cliente.";
    }

    const existingMainChassis = await tx.motorcycle.findUnique({
      where: { chassi: input.motorcycle.chassis },
    });
    if (
      existingMainChassis &&
      existingMainChassis.id !== currentMotorcycle?.id
    ) {
      return existingMainChassis.clientId &&
        existingMainChassis.clientId !== input.clientId
        ? "Este chassi jÃ¡ estÃ¡ vinculado a outro cliente."
        : "Este chassi jÃ¡ estÃ¡ cadastrado em outra motocicleta.";
    }

    const existingAdditional = input.additionalMotorcycle
      ? await tx.motorcycle.findUnique({
          where: { chassi: input.additionalMotorcycle.chassis },
        })
      : null;

    if (existingAdditional && existingAdditional.id === currentMotorcycle?.id) {
      return "A motocicleta adicional nÃ£o pode ser a mesma do cadastro principal.";
    }
    if (
      existingAdditional?.clientId &&
      existingAdditional.clientId !== input.clientId
    ) {
      return "O chassi adicional jÃ¡ estÃ¡ vinculado a outro cliente.";
    }

    await tx.client.update({
      where: { id: input.clientId },
      data: {
        cpf: input.cpf,
        name: input.name,
        sellersName: input.sellerName,
        city: input.city,
        billingDate: input.billingDate ?? null,
      },
    });

    const motorcycleData = {
      chassi: input.motorcycle.chassis,
      model: input.motorcycle.model,
      forecastArrival: input.motorcycle.forecastDate ?? null,
      forecastArrivalStatus: resolveBDCArrivalStatus(
        input.motorcycle.arrivalStatus,
        input.motorcycle.arrivalStatusInput,
        currentMotorcycle?.forecastArrivalStatus,
      ),
      registrationStatus: input.motorcycle.registrationStatus,
      registrationDate: input.motorcycle.registrationDate ?? null,
      clientId: input.clientId,
    };

    if (currentMotorcycle) {
      await tx.motorcycle.update({
        where: { id: currentMotorcycle.id },
        data: motorcycleData,
      });
    } else {
      await tx.motorcycle.create({ data: motorcycleData });
    }

    if (existingAdditional) {
      await tx.motorcycle.update({
        where: { id: existingAdditional.id },
        data: { clientId: input.clientId },
      });
    } else if (input.additionalMotorcycle) {
      await tx.motorcycle.create({
        data: {
          chassi: input.additionalMotorcycle.chassis,
          model: input.additionalMotorcycle.model,
          forecastArrival: input.additionalMotorcycle.forecastDate ?? null,
          clientId: input.clientId,
        },
      });
    }

    return null;
  });
}
