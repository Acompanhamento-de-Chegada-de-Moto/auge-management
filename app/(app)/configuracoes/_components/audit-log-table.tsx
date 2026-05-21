"use client";

import { useState } from "react";
import { Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { getAuditLogs } from "@/lib/data/audit-log";
import { AuditLogDetailDialog } from "./audit-log-detail-dialog";

type AuditLog = Awaited<ReturnType<typeof getAuditLogs>>["logs"][number];

const actionLabels: Record<string, string> = {
  CREATE: "criou",
  UPDATE: "editou",
  DELETE: "removeu",
  IMPORT: "importou",
  LOGIN: "entrou",
  LOGOUT: "saiu",
};

const actionColors: Record<string, string> = {
  CREATE:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  UPDATE: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  IMPORT:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  LOGIN:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  LOGOUT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
};

const entityLabels: Record<string, string> = {
  CLIENT: "Cliente",
  MOTORCYCLE: "Motocicleta",
  USER: "Usuário",
  SPREADSHEET: "Planilha",
};

interface AuditLogTableProps {
  logs: AuditLog[];
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
        Nenhum registro de auditoria encontrado.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[160px]">Data/Hora</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell className="text-sm">{log.userName ?? "—"}</TableCell>
                <TableCell>
                  <Badge className={actionColors[log.action] ?? ""}>
                    {actionLabels[log.action] ?? log.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {entityLabels[log.entityType] ?? log.entityType}
                </TableCell>
                <TableCell className="text-sm">
                  {log.entityName ?? "—"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => setSelectedLog(log)}
                  >
                    <Eye className="size-4" />
                    <span className="sr-only">Ver detalhes</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AuditLogDetailDialog
        log={selectedLog}
        open={!!selectedLog}
        onOpenChange={(open) => {
          if (!open) setSelectedLog(null);
        }}
      />
    </>
  );
}
