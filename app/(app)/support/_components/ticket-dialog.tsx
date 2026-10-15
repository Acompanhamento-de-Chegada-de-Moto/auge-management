"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, SendHorizonal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { replyToTicketAction } from "@/app/(app)/support/_actions/tickets";
import type {
  AdminTicket,
  ManagerTicket,
} from "@/app/data/admin/admin-get-tickets";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { initialsOf } from "@/lib/utils";
import {
  type ReplyTicketInput,
  replyTicketSchema,
} from "@/validators/reply-ticket-schema";
import { priorityConfig, statusConfig } from "./tickets-config";

type Ticket = AdminTicket | ManagerTicket;

interface TicketDialogProps {
  ticket: Ticket;
  children: React.ReactNode;
}

export function TicketDialog({ ticket, children }: TicketDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const form = useForm<ReplyTicketInput>({
    resolver: zodResolver(replyTicketSchema),
    defaultValues: { message: "" },
  });
  const message = form.watch("message");
  const { isSubmitting, errors } = form.formState;
  const [error, setError] = useState<string | null>(null);

  const messageId = useId();
  const ticketId = ticket.id.slice(0, 8);

  const handleReply = async (data: ReplyTicketInput) => {
    setError(null);

    try {
      const result = await replyToTicketAction(ticket.id, data);

      if (result.status === "success") {
        form.reset();
        router.refresh();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar");
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
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] flex flex-col"
        showCloseButton={false}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
              #{ticketId}
            </code>
            <DialogTitle className="text-base">{ticket.subject}</DialogTitle>
          </div>
          <DialogDescription className="mt-1 flex flex-wrap items-center gap-2">
            <span className="sr-only">Prioridade e situação:</span>
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
          {ticket.messages.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Respostas ({ticket.messages.length})
              </p>
              {ticket.messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <Avatar className="size-8 shrink-0 mt-0.5">
                    {msg.user.image && (
                      <AvatarImage src={msg.user.image} alt={msg.user.name} />
                    )}
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
          ) : (
            <p className="rounded-xl border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">
              Nenhuma resposta enviada ainda.
            </p>
          )}
        </div>

        {/* Rodapé — Reply */}
        {(ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") && (
          <div className="border-t pt-4 space-y-3">
            {(error || errors.message) && (
              <p role="alert" className="text-sm font-medium text-red-600">
                {error || errors.message?.message}
              </p>
            )}
            <div className="flex gap-2">
              <label htmlFor={messageId} className="sr-only">
                Responder ao ticket
              </label>
              <textarea
                id={messageId}
                {...form.register("message")}
                aria-invalid={Boolean(errors.message)}
                placeholder="Escreva uma resposta..."
                rows={2}
                disabled={isSubmitting}
                className="flex min-h-[40px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void form.handleSubmit(handleReply)();
                  }
                }}
              />
              <Button
                size="icon"
                onClick={() => void form.handleSubmit(handleReply)()}
                aria-label="Enviar resposta"
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
            Este ticket está{" "}
            {statusConfig[ticket.status]?.label.toLowerCase() ?? "fechado"}.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
