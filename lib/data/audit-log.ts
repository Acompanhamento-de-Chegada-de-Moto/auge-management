import { prisma } from "@/lib/db";
import type {
  AuditAction,
  EntityType,
} from "../../src/generated/prisma/client";

export interface CreateAuditLogInput {
  userId: string;
  userName: string;
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  entityName?: string;
  oldValue?: unknown;
  newValue?: unknown;
  metadata?: unknown;
}

export async function createAuditLog(data: CreateAuditLogInput) {
  return prisma.auditLog.create({
    data: {
      userId: data.userId,
      userName: data.userName,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      entityName: data.entityName,
      oldValue: data.oldValue
        ? JSON.parse(JSON.stringify(data.oldValue))
        : null,
      newValue: data.newValue
        ? JSON.parse(JSON.stringify(data.newValue))
        : null,
      metadata: data.metadata
        ? JSON.parse(JSON.stringify(data.metadata))
        : null,
    },
  });
}

export interface GetAuditLogsFilters {
  page?: number;
  limit?: number;
  action?: AuditAction;
  entityType?: EntityType;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

export async function getAuditLogs(filters: GetAuditLogsFilters = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: {
    action?: { equals: AuditAction };
    entityType?: { equals: EntityType };
    userId?: { equals: string };
    createdAt?: { gte?: Date; lte?: Date };
  } = {};

  if (filters.action) {
    where.action = { equals: filters.action };
  }
  if (filters.entityType) {
    where.entityType = { equals: filters.entityType };
  }
  if (filters.userId) {
    where.userId = { equals: filters.userId };
  }
  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = filters.startDate;
    if (filters.endDate) where.createdAt.lte = filters.endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
