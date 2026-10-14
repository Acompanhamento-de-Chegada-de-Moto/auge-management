import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { arrivalDelayedWhere } from "./arrival-status";

const motorcycleSelect = {
  id: true,
  chassi: true,
  model: true,
  forecastArrival: true,
  forecastArrivalStatus: true,
  arrivedAt: true,
} as const;

export const listCheckInOperators = () =>
  prisma.checkInOperator.findMany({
    select: {
      id: true,
      name: true,
      identifier: true,
      active: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });
export async function findCheckInOperator(identifier: string) {
  const operators = await prisma.checkInOperator.findMany({
    where: {
      OR: [
        { identifier },
        { name: { equals: identifier, mode: "insensitive" } },
      ],
    },
    take: 2,
  });
  // Ambiguous names must never select an arbitrary person's credentials.
  return operators.length === 1 ? operators[0] : null;
}
export const createCheckInOperator = (data: {
  name: string;
  identifier: string;
  pinHash: string;
}) => prisma.checkInOperator.create({ data, select: { id: true } });
export const deleteCheckInOperator = (id: string) =>
  prisma.checkInOperator.deleteMany({ where: { id } });
export async function changeOperatorCredentials(id: string, pinHash?: string) {
  return prisma.$transaction(async (tx) => {
    await tx.checkInOperator.update({
      where: { id },
      data: pinHash
        ? { pinHash, active: true, failedAttempts: 0, lockedUntil: null }
        : { active: false },
    });
    await tx.checkInSession.deleteMany({ where: { operatorId: id } });
  });
}
export async function recordPinFailure(id: string) {
  // Atomic increment: simultaneous attempts cannot lose the failure counter.
  await prisma.$executeRaw`
    UPDATE check_in_operators SET
      "failedAttempts" = CASE WHEN "lockedUntil" <= timezone('UTC', NOW()) THEN 1 ELSE "failedAttempts" + 1 END,
      "lockedUntil" = CASE WHEN "lockedUntil" <= timezone('UTC', NOW()) THEN NULL
        WHEN "failedAttempts" + 1 >= 5 THEN timezone('UTC', NOW()) + INTERVAL '15 minutes' ELSE "lockedUntil" END
    WHERE id = ${id}::uuid
  `;
}
export async function openCheckInSession(
  operatorId: string,
  pinHash: string,
  tokenHash: string,
  expiresAt: Date,
) {
  return prisma.$transaction(async (tx) => {
    // Credential rotation/revocation must serialize with issuing a new session.
    const updated = await tx.checkInOperator.updateMany({
      where: {
        id: operatorId,
        pinHash,
        active: true,
        OR: [{ lockedUntil: null }, { lockedUntil: { lte: new Date() } }],
      },
      data: { failedAttempts: 0, lockedUntil: null },
    });
    if (!updated.count) return false;
    await tx.checkInSession.deleteMany({
      where: { expiresAt: { lte: new Date() } },
    });
    await tx.checkInSession.create({
      data: { operatorId, tokenHash, expiresAt },
    });
    return true;
  });
}
export const findCheckInSession = (tokenHash: string) =>
  prisma.checkInSession.findUnique({
    where: { tokenHash },
    include: { operator: true },
  });
export const closeCheckInSession = (tokenHash: string) =>
  prisma.checkInSession.deleteMany({ where: { tokenHash } });
export const findCheckInMotorcycle = (chassi: string) =>
  prisma.motorcycle.findUnique({ where: { chassi }, select: motorcycleSelect });

export async function receiveMotorcycle(
  tx: Prisma.TransactionClient,
  input: {
    motorcycleId: string;
    chassi: string;
    source: "MANUAL" | "QR_CODE";
    operatorId: string | null;
    actorLabel: string;
  },
) {
  const now = new Date();
  const updated = await tx.motorcycle.updateMany({
    where: {
      id: input.motorcycleId,
      chassi: input.chassi,
      arrivedAt: null,
      forecastArrivalStatus: { not: "ARRIVED" },
    },
    data: { arrivedAt: now, forecastArrivalStatus: "ARRIVED" },
  });
  if (updated.count)
    await tx.motorcycleReceipt.create({
      data: {
        motorcycleId: input.motorcycleId,
        operatorId: input.operatorId,
        actorLabel: input.actorLabel,
        source: input.source,
        arrivedAt: now,
      },
    });
  return tx.motorcycle.findFirst({
    where: { id: input.motorcycleId, chassi: input.chassi },
    select: motorcycleSelect,
  });
}

export async function markOverdueMotorcycles() {
  return prisma.motorcycle.updateMany({
    where: {
      AND: [
        arrivalDelayedWhere(),
        { forecastArrivalStatus: { not: "DELAYED" } },
      ],
    },
    data: { forecastArrivalStatus: "DELAYED" },
  });
}
