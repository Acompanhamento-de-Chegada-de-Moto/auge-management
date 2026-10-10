import "server-only";

import { createHash } from "node:crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

type ApiSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
type ApiRole = ApiSession["user"]["role"];
let lastRateLimitCleanupAt = 0;

export function apiError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

interface ApiRateLimitOptions {
  scope?: string;
  maxRequests?: number;
  windowSeconds?: number;
}

async function checkApiRateLimit(
  userId: string,
  request: Request,
  options: ApiRateLimitOptions = {},
) {
  return checkMutationRateLimit(
    userId,
    request.method,
    normalizeApiPath(new URL(request.url).pathname),
    options,
  );
}

export async function checkMutationRateLimit(
  userId: string,
  requestMethod: string,
  routeScope: string,
  options: ApiRateLimitOptions = {},
) {
  await cleanupExpiredRateLimits();

  const maxRequests = options.maxRequests ?? 60;
  const windowSeconds = options.windowSeconds ?? 60;
  const windowMs = windowSeconds * 1000;
  const now = Date.now();
  const windowStartMs = Math.floor(now / windowMs) * windowMs;
  const windowStart = new Date(windowStartMs);
  const windowEndMs = windowStartMs + windowMs;
  const expiresAt = new Date(windowEndMs + 24 * 60 * 60 * 1000);
  const method = requestMethod.toUpperCase();
  const route = options.scope ?? routeScope;
  const key = createHash("sha256")
    .update(`${userId}:${method}:${route}`)
    .digest("hex");

  const rows = await prisma.$queryRaw<Array<{ count: number }>>`
    INSERT INTO "api_rate_limits" AS existing_bucket
      ("key", "windowStart", "count", "expiresAt")
    VALUES (${key}, ${windowStart}, 1, ${expiresAt})
    ON CONFLICT ("key") DO UPDATE SET
      "windowStart" = EXCLUDED."windowStart",
      "count" = CASE
        WHEN existing_bucket."windowStart" = EXCLUDED."windowStart"
          THEN existing_bucket."count" + 1
        ELSE 1
      END,
      "expiresAt" = EXCLUDED."expiresAt"
    RETURNING "count"
  `;

  const count = rows[0]?.count ?? 0;
  if (count <= maxRequests) return null;

  const retryAfter = Math.max(1, Math.ceil((windowEndMs - now) / 1000));
  return Response.json(
    { error: "Muitas requisições. Tente novamente em instantes." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}

async function cleanupExpiredRateLimits() {
  const now = Date.now();
  if (now - lastRateLimitCleanupAt < 15 * 60 * 1000) return;
  lastRateLimitCleanupAt = now;

  await Promise.all([
    prisma.apiRateLimit.deleteMany({
      where: { expiresAt: { lt: new Date(now) } },
    }),
    prisma.$executeRaw`
      DELETE FROM "rateLimit"
      WHERE "lastRequest" < ${BigInt(now - 24 * 60 * 60 * 1000)}
    `,
  ]);
}

function normalizeApiPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const routeSegments = segments.slice(0, 4);
  if (segments.length > routeSegments.length) routeSegments.push(":id");
  return `/${routeSegments.join("/")}`;
}

export async function authorizeApiRequest(
  request: Request,
  allowedRoles?: readonly ApiRole[],
  rateLimitOptions?: ApiRateLimitOptions,
): Promise<
  | { session: ApiSession; response?: never }
  | { session?: never; response: Response }
> {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return { response: apiError("Não autenticado.", 401) };
  }

  const rateLimitResponse = await checkApiRateLimit(
    session.user.id,
    request,
    rateLimitOptions,
  );
  if (rateLimitResponse) return { response: rateLimitResponse };

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return { response: apiError("Acesso negado.", 403) };
  }

  return { session };
}

export function assertSameOrigin(request: Request): Response | null {
  const origin = request.headers.get("origin");

  if (!origin) {
    return apiError("Origem da requisição não informada.", 403);
  }

  try {
    if (new URL(origin).origin !== new URL(request.url).origin) {
      return apiError("Origem da requisição não permitida.", 403);
    }
  } catch {
    return apiError("Origem da requisição inválida.", 403);
  }

  return null;
}

export async function readJsonBody(
  request: Request,
  maxBodyBytes = 64 * 1024,
): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length"));

  if (declaredLength > maxBodyBytes) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBodyBytes) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }

  return JSON.parse(text) as unknown;
}

export { normalizeDateFields } from "@/lib/server/normalize-date-fields";
