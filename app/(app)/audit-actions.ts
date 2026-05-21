"use server";

import { requireAuth } from "@/app/data/require-user";
import { createAuditLog } from "@/lib/data/audit-log";

export async function auditLogoutAction() {
  const user = await requireAuth();
  await createAuditLog({
    userId: user.id,
    userName: user.name,
    action: "LOGOUT",
    entityType: "USER",
    entityId: user.id,
    entityName: user.name,
  });
}
