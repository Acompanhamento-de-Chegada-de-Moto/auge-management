"use server";

import { cookies, headers } from "next/headers";
import { checkMutationRateLimit } from "@/lib/api/auth";
import { withArrivalStatus } from "@/lib/arrival";
import { getCheckInAccess } from "@/lib/check-in/access";
import {
  generateToken,
  tokenHash,
  verifyPin,
} from "@/lib/check-in/credentials";
import { revalidateArrivals } from "@/lib/check-in/revalidate";
import {
  type CheckInMotorcycle,
  chassisSchema,
  confirmationSchema,
  pinLoginSchema,
} from "@/lib/check-in/schemas";
import { CHECK_IN_COOKIE } from "@/lib/check-in/session";
import {
  closeCheckInSession,
  findCheckInMotorcycle,
  findCheckInOperator,
  openCheckInSession,
  recordPinFailure,
} from "@/lib/data/check-in";
import {
  receiveCheckInMotorcycle,
  receiveStaffCheckInMotorcycle,
} from "@/lib/services/check-in/receive";

type Result = { ok: boolean; message: string; motorcycle?: CheckInMotorcycle };
const unavailable = {
  ok: false,
  message: "Sessão encerrada. Entre com sua conta ou com nome e PIN.",
};
const serializeMotorcycle = (
  motorcycle: NonNullable<Awaited<ReturnType<typeof findCheckInMotorcycle>>>,
) => ({
  ...withArrivalStatus(motorcycle),
  forecastArrival: motorcycle.forecastArrival?.toISOString() ?? null,
  arrivedAt: motorcycle.arrivedAt?.toISOString() ?? null,
});

export async function loginCheckInAction(input: unknown): Promise<Result> {
  const parsed = pinLoginSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      message: "Informe o nome e o PIN de 8 dígitos.",
    };
  const { identifier, pin } = parsed.data;
  const requestHeaders = await headers();
  // Configure the deployment proxy to overwrite x-forwarded-for; the account
  // bucket and persistent lockout remain effective without trusted IP headers.
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limits = await Promise.all([
    checkMutationRateLimit(
      `check-in-account:${identifier}`,
      "POST",
      "/check-in/login",
      { maxRequests: 10, windowSeconds: 900 },
    ),
    checkMutationRateLimit(
      `check-in-ip:${ip.slice(0, 100)}`,
      "POST",
      "/check-in/login",
      { maxRequests: 30, windowSeconds: 900 },
    ),
  ]);
  if (limits.some(Boolean))
    return {
      ok: false,
      message: "Muitas tentativas. Tente novamente em 15 minutos.",
    };
  const operator = await findCheckInOperator(identifier);
  const invalid = {
    ok: false,
    message: "Nome ou PIN inválido, ou acesso temporariamente bloqueado.",
  };
  if (
    !operator?.active ||
    (operator.lockedUntil && operator.lockedUntil > new Date())
  )
    return invalid;
  if (!(await verifyPin(pin, operator.pinHash))) {
    await recordPinFailure(operator.id);
    return invalid;
  }
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  if (
    !(await openCheckInSession(
      operator.id,
      operator.pinHash,
      tokenHash(token),
      expiresAt,
    ))
  )
    return invalid;
  const cookieStore = await cookies();
  const previous = cookieStore.get(CHECK_IN_COOKIE)?.value;
  if (previous) await closeCheckInSession(tokenHash(previous));
  cookieStore.set(CHECK_IN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/check-in",
    expires: expiresAt,
  });
  return { ok: true, message: "Acesso liberado para este turno." };
}

export async function logoutCheckInAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CHECK_IN_COOKIE)?.value;
  if (token) await closeCheckInSession(tokenHash(token));
  cookieStore.delete({ name: CHECK_IN_COOKIE, path: "/check-in" });
}

export async function lookupMotorcycleAction(input: unknown): Promise<Result> {
  const session = await getCheckInAccess();
  if (!session) return unavailable;
  if (await checkMutationRateLimit(session.id, "POST", "/check-in/lookup"))
    return { ok: false, message: "Muitas consultas. Aguarde um minuto." };
  const parsed = chassisSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Chassi inválido." };
  const motorcycle = await findCheckInMotorcycle(parsed.data.chassi);
  return motorcycle
    ? {
        ok: true,
        message: "Motocicleta encontrada.",
        motorcycle: serializeMotorcycle(motorcycle),
      }
    : { ok: false, message: "Motocicleta não encontrada. Confira o chassi." };
}

export async function confirmArrivalAction(input: unknown): Promise<Result> {
  const session = await getCheckInAccess();
  if (!session) return unavailable;
  if (await checkMutationRateLimit(session.id, "POST", "/check-in/confirm"))
    return { ok: false, message: "Muitas confirmações. Aguarde um minuto." };
  const parsed = confirmationSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      message: "Confirmação inválida. Consulte novamente o chassi.",
    };
  const motorcycle =
    session.kind === "staff"
      ? await receiveStaffCheckInMotorcycle({
          ...parsed.data,
          sessionId: session.sessionId,
          userId: session.id,
        })
      : await receiveCheckInMotorcycle({
          ...parsed.data,
          sessionId: session.sessionId,
          operatorId: session.id,
        });
  if (!motorcycle)
    return {
      ok: false,
      message:
        "Não foi possível confirmar. Verifique o acesso e consulte novamente.",
    };
  revalidateArrivals("action");
  return {
    ok: true,
    message: "Recebimento confirmado.",
    motorcycle: serializeMotorcycle(motorcycle),
  };
}
