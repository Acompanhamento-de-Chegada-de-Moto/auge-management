import "server-only";

import type { auth } from "@/lib/auth";

export type MutationActor = {
  user: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>["user"];
  transport: "action" | "route";
};

export type MutationResult = {
  statusCode: number;
  message: string;
  data?: unknown;
};

export function mutationError(
  message: string,
  statusCode: number,
): MutationResult {
  return { statusCode, message };
}

export function mutationSuccess(
  body: { message: string; data?: unknown },
  options?: { status: number },
): MutationResult {
  return { statusCode: options?.status ?? 200, ...body };
}
