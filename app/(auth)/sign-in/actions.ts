"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createAuditLog } from "@/lib/data/audit-log";

export async function auditLoginAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    await createAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      action: "LOGIN",
      entityType: "USER",
      entityId: session.user.id,
      entityName: session.user.name,
    });
  }
}
