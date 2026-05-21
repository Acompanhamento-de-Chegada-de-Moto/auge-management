"use server";

import { requireUser } from "@/app/data/require-user";
import { prisma } from "@/lib/db";
import { createAuditLog, getAuditLogs } from "@/lib/data/audit-log";
import { sanitizeForAudit } from "@/lib/utils";
import type { AuditAction, EntityType } from "@/src/generated/prisma/client";
import bcryptjs from "bcryptjs";

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

    const hashedPassword = await bcryptjs.hash(data.password, 10);

    // Cria o usuário com role USER
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        emailVerified: true,
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Cria a account com a senha hashed para o better-auth
    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: data.email,
        providerId: "credential",
        userId: user.id,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

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
