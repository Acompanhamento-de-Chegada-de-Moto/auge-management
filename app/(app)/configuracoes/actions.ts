"use server";

import { headers } from "next/headers";
import { requireUser } from "@/app/data/require-user";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createAuditLog, getAuditLogs } from "@/lib/data/audit-log";
import { sanitizeForAudit } from "@/lib/utils";
import type { AuditAction, EntityType } from "@/src/generated/prisma/client";

export async function createUserAction(data: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    // Verifica se quem chama é ADMIN
    const admin = await requireUser();

    // Verifica se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Este e-mail já está em uso.",
      };
    }

    // Usa a API nativa do better-auth para criar o usuário corretamente
    const result = await auth.api.signUpEmail({
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: "USER",
      },
      headers: await headers(),
    });

    const user = result.user;

    await createAuditLog({
      userId: admin.id,
      userName: admin.name,
      action: "CREATE",
      entityType: "USER",
      entityId: user.id,
      entityName: user.name,
      newValue: sanitizeForAudit({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }),
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return {
      success: false,
      error: "Erro ao criar usuário. Tente novamente.",
    };
  }
}

export async function getAuditLogsAction(filters: {
  page?: number;
  limit?: number;
  action?: AuditAction;
  entityType?: EntityType;
  startDate?: Date;
  endDate?: Date;
}) {
  await requireUser();
  return getAuditLogs(filters);
}
