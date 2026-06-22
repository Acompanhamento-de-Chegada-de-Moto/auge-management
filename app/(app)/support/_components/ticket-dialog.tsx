"use client";

import { Loader2, SendHorizonal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { AdminTicket, ManagerTicket } from "@/app/data/admin/admin-get-tickets";
import { addTicketMessageAction } from "@/app/(app)/support/actions";

type Ticket = AdminTicket | ManagerTicket;

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

function initialsOf(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

interface TicketDialogProps {
  ticket: Ticket;
  children: React.ReactNode;
}

export function TicketDialog({ ticket, children }: TicketDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messageId = useId();
  const ticketId = ticket.id.slice(0, 8);

  const handleReply = async () => {
    if (!message.trim()) {
      setError("Mensagem não pode estar vazia");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await addTicketMessageAction(ticket.id, message);

      if (result.status === "success") {
        setMessage("");
        router.refresh();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const creatorName = "createdBy" in ticket ? ticket.createdBy.name : "—";

  return (
    <Dialog
      open={open}
      onOpenChange={(nowOpen) => {
        setOpen(nowOpen);
        if (!nowOpen) setError(null);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
              #{ticketId}
            </code>
            <DialogTitle className="text-base">{ticket.subject}</DialogTitle>
          </div>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-1">
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
              <span className="text-xs text-muted-foreground">
                Criado por {creatorName} em{" "}
                {new Date(ticket.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 px-1">
          {/* Descrição original */}
          <div className="rounded-lg border bg-muted/30 p-4 text-sm">
            <p className="whitespace-pre-wrap text-foreground">
              {ticket.description}
            </p>
          </div>

          {/* Thread de mensagens */}
          {ticket.messages.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Respostas ({ticket.messages.length})
              </p>
              {ticket.messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <Avatar className="size-8 shrink-0 mt-0.5">
                    {msg.user.image ? (
                      <img
                        src={msg.user.image}
                        alt={msg.user.name}
                        className="size-full rounded-full object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="text-[10px]">
                      {initialsOf(msg.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {msg.user.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap mt-0.5">
                      {msg.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé — Reply */}
        {(ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") && (
          <div className="border-t pt-4 space-y-3">
            {error && (
              <p role="alert" className="text-sm font-medium text-red-600">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <textarea
                id={messageId}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escreva uma resposta..."
                rows={2}
                disabled={isSubmitting}
                className="flex min-h-[40px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleReply();
                  }
                }}
              />
              <Button
                size="icon"
                onClick={handleReply}
                disabled={isSubmitting || !message.trim()}
                className="shrink-0 self-end"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <SendHorizonal className="size-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {ticket.status !== "OPEN" && ticket.status !== "IN_PROGRESS" && (
          <div className="border-t pt-4 text-center text-sm text-muted-foreground">
            Este ticket está {statusConfig[ticket.status]?.label.toLowerCase() ?? "fechado"}.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
