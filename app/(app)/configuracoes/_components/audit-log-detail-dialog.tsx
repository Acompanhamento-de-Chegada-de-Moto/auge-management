"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { getAuditLogs } from "@/lib/data/audit-log";

type AuditLog = Awaited<ReturnType<typeof getAuditLogs>>["logs"][number];

interface AuditLogDetailDialogProps {
  log: AuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditLogDetailDialog({
  log,
  open,
  onOpenChange,
}: AuditLogDetailDialogProps) {
  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes da Ação</DialogTitle>
          <DialogDescription>
            {log.action} em {new Date(log.createdAt).toLocaleString("pt-BR")}
            {log.userName ? ` por ${log.userName}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {log.oldValue && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Antes
              </p>
              <pre className="max-h-48 overflow-auto rounded-lg bg-muted p-3 text-xs">
                {JSON.stringify(log.oldValue, null, 2)}
              </pre>
            </div>
          )}

          {log.newValue && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Depois
              </p>
              <pre className="max-h-48 overflow-auto rounded-lg bg-muted p-3 text-xs">
                {JSON.stringify(log.newValue, null, 2)}
              </pre>
            </div>
          )}

          {log.metadata && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Metadados
              </p>
              <pre className="max-h-48 overflow-auto rounded-lg bg-muted p-3 text-xs">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}

          {!log.oldValue && !log.newValue && !log.metadata && (
            <p className="text-sm text-muted-foreground">
              Nenhum dado adicional disponível para este registro.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
