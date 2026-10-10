"use client";

import {
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  Eye,
  Search,
  Ticket as TicketIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { updateTicketStatusAction } from "@/app/(app)/support/_actions/tickets";
import type {
  AdminTicket,
  ManagerTicket,
} from "@/app/data/admin/admin-get-tickets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TicketDialog } from "./ticket-dialog";
import { priorityConfig, statusConfig, statusOptions } from "./tickets-config";

type TicketItem = AdminTicket | ManagerTicket;
type TicketStatus = "ALL" | "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

interface TicketListProps {
  tickets: TicketItem[];
  canManageStatus: boolean;
}

const statusFilters: TicketStatus[] = [
  "ALL",
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function TicketList({ tickets, canManageStatus }: TicketListProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      open: tickets.filter((ticket) => ticket.status === "OPEN").length,
      inProgress: tickets.filter((ticket) => ticket.status === "IN_PROGRESS")
        .length,
      resolved: tickets.filter(
        (ticket) => ticket.status === "RESOLVED" || ticket.status === "CLOSED",
      ).length,
    }),
    [tickets],
  );

  const filteredTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return tickets.filter((ticket) => {
      const matchesStatus =
        statusFilter === "ALL" || ticket.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        ticket.subject.toLocaleLowerCase("pt-BR").includes(normalizedQuery) ||
        ticket.description
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedQuery) ||
        ("createdBy" in ticket &&
          ticket.createdBy.name
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter, tickets]);

  async function handleStatusChange(ticketId: string, status: string) {
    setUpdatingId(ticketId);
    try {
      const result = await updateTicketStatusAction(ticketId, { status });
      if (result.status !== "success") {
        toast.error(result.message);
        return;
      }
      toast.success("Status do ticket atualizado.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o status.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section aria-label="Lista de tickets" className="space-y-5">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl border border-border/70 bg-background p-3 sm:p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CircleDot className="size-4 text-emerald-600" />
            <span className="text-xs sm:text-sm">Abertos</span>
          </div>
          <p className="mt-2 text-xl font-semibold tabular-nums">
            {counts.open}
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background p-3 sm:p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock3 className="size-4 text-primary" />
            <span className="text-xs sm:text-sm">Em andamento</span>
          </div>
          <p className="mt-2 text-xl font-semibold tabular-nums">
            {counts.inProgress}
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background p-3 sm:p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="size-4" />
            <span className="text-xs sm:text-sm">Concluídos</span>
          </div>
          <p className="mt-2 text-xl font-semibold tabular-nums">
            {counts.resolved}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Buscar tickets por assunto ou descrição"
            placeholder="Buscar por assunto, descrição ou solicitante..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
          />
        </div>
        <label className="relative block sm:w-52">
          <span className="sr-only">Filtrar tickets por status</span>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as TicketStatus)
            }
            className="select h-11 w-full appearance-none rounded-xl border-base-300 bg-base-100 px-3.5 pr-9 text-sm focus:border-primary focus:outline-2 focus:outline-primary/30"
          >
            {statusFilters.map((status) => (
              <option key={status} value={status}>
                {status === "ALL"
                  ? "Todos os status"
                  : statusConfig[status].label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
        </label>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/10 px-5 py-10 text-center">
          <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted">
            <TicketIcon className="size-5 text-muted-foreground" />
          </span>
          <p className="text-sm font-medium">
            {tickets.length === 0
              ? "Nenhum ticket por aqui ainda"
              : "Nenhum ticket encontrado"}
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {tickets.length === 0
              ? "Abra um chamado usando o formulário para pedir ajuda à equipe de suporte."
              : "Ajuste a busca ou o filtro de status para encontrar o chamado."}
          </p>
          {(query || statusFilter !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => {
                setQuery("");
                setStatusFilter("ALL");
              }}
            >
              Limpar filtros
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filteredTickets.map((ticket) => (
              <article
                key={ticket.id}
                className="space-y-3 rounded-2xl border border-border/70 bg-background p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-muted-foreground">
                      #{ticket.id.slice(0, 8)}
                    </p>
                    <h3 className="mt-1 break-words text-sm font-semibold">
                      {ticket.subject}
                    </h3>
                    {canManageStatus && "createdBy" in ticket && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Por {ticket.createdBy.name}
                      </p>
                    )}
                  </div>
                  <TicketDialog ticket={ticket}>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 shrink-0"
                      aria-label={`Ver ticket ${ticket.subject}`}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </TicketDialog>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={priorityConfig[ticket.priority]?.className}
                  >
                    {priorityConfig[ticket.priority]?.label ?? ticket.priority}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={statusConfig[ticket.status]?.className}
                  >
                    {statusConfig[ticket.status]?.label ?? ticket.status}
                  </Badge>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formatDate(ticket.createdAt)}
                  </span>
                </div>
                {canManageStatus && (
                  <StatusMenu
                    ticket={ticket}
                    updating={updatingId === ticket.id}
                    onChange={handleStatusChange}
                  />
                )}
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-border/70 md:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Ticket</TableHead>
                    {canManageStatus && <TableHead>Solicitante</TableHead>}
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aberto em</TableHead>
                    <TableHead className="w-24 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="max-w-[24rem]">
                        <div className="min-w-0">
                          <p className="font-mono text-[11px] text-muted-foreground">
                            #{ticket.id.slice(0, 8)}
                          </p>
                          <p className="truncate text-sm font-medium">
                            {ticket.subject}
                          </p>
                        </div>
                      </TableCell>
                      {canManageStatus && (
                        <TableCell className="max-w-40 truncate text-sm text-muted-foreground">
                          {"createdBy" in ticket ? ticket.createdBy.name : "—"}
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={priorityConfig[ticket.priority]?.className}
                        >
                          {priorityConfig[ticket.priority]?.label ??
                            ticket.priority}
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
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(ticket.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <TicketDialog ticket={ticket}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              aria-label={`Ver ticket ${ticket.subject}`}
                            >
                              <Eye className="size-4" />
                            </Button>
                          </TicketDialog>
                          {canManageStatus && (
                            <StatusMenu
                              ticket={ticket}
                              updating={updatingId === ticket.id}
                              onChange={handleStatusChange}
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Exibindo {filteredTickets.length} de {tickets.length} tickets
          </p>
        </>
      )}
    </section>
  );
}

function StatusMenu({
  ticket,
  updating,
  onChange,
}: {
  ticket: TicketItem;
  updating: boolean;
  onChange: (ticketId: string, status: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-full sm:w-auto"
          disabled={updating}
          aria-label={`Alterar status do ticket ${ticket.subject}`}
        >
          {updating ? "Atualizando..." : "Alterar status"}
          <ChevronDown className="ml-2 size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusOptions.map((status) => (
          <DropdownMenuItem
            key={status}
            disabled={ticket.status === status || updating}
            onClick={() => onChange(ticket.id, status)}
          >
            {statusConfig[status]?.label ?? status}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
