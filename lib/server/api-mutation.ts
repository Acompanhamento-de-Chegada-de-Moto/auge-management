import "server-only";

import {
  apiError,
  assertSameOrigin,
  authorizeApiRequest,
  readJsonBody,
} from "@/lib/api/auth";
import type { MutationActor, MutationResult } from "./mutation-result";

export async function runApiMutation(
  request: Request,
  options: {
    roles?: Parameters<typeof authorizeApiRequest>[1];
    rateLimit?: Parameters<typeof authorizeApiRequest>[2];
    maxBodyBytes?: number;
    execute: (input: unknown, actor: MutationActor) => Promise<MutationResult>;
  },
) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const authorization = await authorizeApiRequest(
    request,
    options.roles,
    options.rateLimit,
  );
  if (authorization.response) return authorization.response;

  try {
    const input =
      request.method === "DELETE"
        ? undefined
        : await readJsonBody(request, options.maxBodyBytes);
    const result = await options.execute(input, {
      user: authorization.session.user,
      transport: "route",
    });
    return Response.json(
      result.statusCode >= 400
        ? { error: result.message }
        : { message: result.message, data: result.data },
      { status: result.statusCode },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE")
      return apiError("Requisição muito grande.", 413);
    if (error instanceof SyntaxError) return apiError("JSON inválido.", 400);
    console.error("[api mutation]", error);
    return apiError("Não foi possível concluir a operação.", 500);
  }
}
