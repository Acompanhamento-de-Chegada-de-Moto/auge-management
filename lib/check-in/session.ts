import "server-only";
import { cookies } from "next/headers";
import { findCheckInSession } from "@/lib/data/check-in";
import { tokenHash } from "./credentials";

export const CHECK_IN_COOKIE = "auge-check-in";
export async function getCheckInSession() {
  const token = (await cookies()).get(CHECK_IN_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await findCheckInSession(tokenHash(token));
  return session?.operator.active && session.expiresAt > new Date()
    ? session
    : null;
}
