import "server-only";
import { receiveMotorcycle } from "@/lib/data/check-in";
import { prisma } from "@/lib/db";

export async function receiveCheckInMotorcycle(input: {
  motorcycleId: string;
  chassi: string;
  source: "MANUAL" | "QR_CODE";
  sessionId: string;
  operatorId: string;
}) {
  return prisma.$transaction(async (tx) => {
    // Authorization belongs at the service boundary; lock it until the DAL
    // finishes so revocation cannot race a receipt already being confirmed.
    const valid = await tx.$queryRaw<Array<{ name: string }>>`
      SELECT o.name FROM check_in_operators o JOIN check_in_sessions s ON s."operatorId" = o.id
      WHERE o.id = ${input.operatorId}::uuid AND o.active = true
        AND s.id = ${input.sessionId}::uuid AND s."expiresAt" > timezone('UTC', NOW())
      FOR UPDATE OF o, s
    `;
    if (!valid.length) return null;
    return receiveMotorcycle(tx, { ...input, actorLabel: valid[0].name });
  });
}

export async function receiveStaffCheckInMotorcycle(input: {
  motorcycleId: string;
  chassi: string;
  source: "MANUAL" | "QR_CODE";
  sessionId: string;
  userId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const valid = await tx.$queryRaw<Array<{ name: string }>>`
      SELECT u.name FROM "user" u JOIN "session" s ON s."userId" = u.id
      WHERE u.id = ${input.userId} AND u.banned = false
        AND s.id = ${input.sessionId} AND s."expiresAt" > timezone('UTC', NOW())
      FOR UPDATE OF u, s
    `;
    if (!valid.length) return null;
    return receiveMotorcycle(tx, {
      ...input,
      operatorId: null,
      actorLabel: `${valid[0].name} (${input.userId})`,
    });
  });
}
