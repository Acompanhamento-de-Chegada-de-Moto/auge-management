"use client";

import { Eye, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminTicket, ManagerTicket } from "@/app/data/admin/admin-get-tickets";
import { updateTicketStatusAction } from "@/app/(app)/support/actions";
import { TicketDialog } from "./ticket-dialog";

const priorityConfig: Record<string, { label: string; className: string }> = {
  NORMAL: {
    label: "Normal",
    className:
      "border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  HIGH: {
    label: "Alta",
    className:
      "border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
  URGENT: {
    label: "Urgente",
    className:
      "border-red-200 bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  OPEN: {
    label: "Aberto",
    className:
      "border-green-200 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  IN_PROGRESS: {
    label: "Em Andamento",
    className:
      "border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  RESOLVED: {
    label: "Resolvido",
    className:
      "border-gray-200 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  },
  CLOSED: {
    label: "Fechado",
    className:
      "border-gray-200 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  },
};

const statusOptions = ["IN_PROGRESS", "RESOLVED", "CLOSED"];

type Ticket = AdminTicket | ManagerTicket;

interface TicketListProps {
  tickets: Ticket[];
  canManageStatus: boolean;
}

export function TicketList({ tickets, canManageStatus }: TicketListProps) {
  const router = useRouter();

  const handleStatusChange = async (ticketId: string, status: string) => {
    await updateTicketStatusAction(ticketId, status);
    router.refresh();
  };

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-10 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <Ticket className="size-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Nenhum ticket aberto</p>
          <p className="text-xs text-muted-foreground">
            Use o formulário ao lado para criar seu primeiro ticket
          </p>
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-20">ID</TableHead>
          <TableHead>Assunto</TableHead>
          {canManageStatus && <TableHead>Criado por</TableHead>}
          <TableHead>Prioridade</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead className="w-0">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell>
              <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
                #{ticket.id.slice(0, 8)}
              </code>
            </TableCell>
            <TableCell>
              <p className="text-sm font-medium leading-tight">
                {ticket.subject}
              </p>
            </TableCell>
            {canManageStatus && (
              <TableCell className="text-sm text-muted-foreground">
                {"createdBy" in ticket ? ticket.createdBy.name : "—"}
              </TableCell>
            )}
            <TableCell>
              <Badge
                variant="outline"
                className={priorityConfig[ticket.priority]?.className}
              >
                {priorityConfig[ticket.priority]?.label ?? ticket.priority}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={statusConfig[ticket.status]?.className}
              >
                {statusConfig[ticket.status]?.label ?? ticket.status}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
              {new Date(ticket.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <TicketDialog ticket={ticket}>
                  <Button variant="ghost" size="icon" className="size-8">
                    <Eye className="size-4" />
                  </Button>
                </TicketDialog>

                {canManageStatus && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        Status
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {statusOptions.map((s) => (
                        <DropdownMenuItem
                          key={s}
                          disabled={ticket.status === s}
                          onClick={() => handleStatusChange(ticket.id, s)}
                        >
                          {statusConfig[s]?.label ?? s}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
