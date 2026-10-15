import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getCheckInSession } from "./session";

export async function getCheckInAccess() {
  const operatorSession = await getCheckInSession();
  if (operatorSession)
    return {
      kind: "operator" as const,
      id: operatorSession.operatorId,
      sessionId: operatorSession.id,
      name: operatorSession.operator.name,
      expiresAt: operatorSession.expiresAt,
    };
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.banned) return null;
  return {
    kind: "staff" as const,
    id: session.user.id,
    sessionId: session.session.id,
    name: session.user.name,
    expiresAt: new Date(session.session.expiresAt),
  };
}
