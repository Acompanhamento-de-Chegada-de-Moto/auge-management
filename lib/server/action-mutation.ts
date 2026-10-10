import "server-only";

import { headers } from "next/headers";
import { checkMutationRateLimit } from "@/lib/api/auth";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";
import type { MutationActor, MutationResult } from "./mutation-result";

export async function runActionMutation(options: {
  scope: string;
  method: string;
  roles?: readonly MutationActor["user"]["role"][];
  import?: boolean;
  input?: unknown;
  execute: (actor: MutationActor) => Promise<MutationResult>;
}): Promise<ApiResponse & { data?: unknown }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { status: "error", message: "Não autenticado." };
    if (options.roles && !options.roles.includes(session.user.role))
      return { status: "error", message: "Acesso negado." };
    const size = new TextEncoder().encode(
      JSON.stringify(options.input) ?? "",
    ).byteLength;
    if (size > (options.import ? 5 * 1024 * 1024 : 64 * 1024))
      return { status: "error", message: "Requisição muito grande." };
    const limited = await checkMutationRateLimit(
      session.user.id,
      options.method,
      options.scope,
      options.import
        ? { scope: options.scope, maxRequests: 3, windowSeconds: 600 }
        : undefined,
    );
    if (limited)
      return {
        status: "error",
        message: "Muitas requisições. Tente novamente em instantes.",
      };
    const result = await options.execute({
      user: session.user,
      transport: "action",
    });
    return {
      status: result.statusCode < 400 ? "success" : "error",
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    console.error("[server action]", error);
    return {
      status: "error",
      message: "Não foi possível concluir a operação. Tente novamente.",
    };
  }
}
