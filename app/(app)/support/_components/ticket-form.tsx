"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MessageSquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createTicketAction } from "@/app/(app)/support/_actions/tickets";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type CreateTicketInput,
  createTicketSchema,
} from "@/validators/create-ticket-schema";
import { priorityConfig } from "./tickets-config";

export function TicketForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const form = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: { subject: "", description: "", priority: "NORMAL" },
  });
  const subject = form.watch("subject");
  const description = form.watch("description");
  const priority = form.watch("priority");
  const { isSubmitting, errors } = form.formState;
  const formError =
    errors.subject?.message ??
    errors.description?.message ??
    errors.priority?.message;
  const [error, setError] = useState<string | null>(null);

  const subjectId = useId();
  const descriptionId = useId();

  const handleSubmit = async (data: CreateTicketInput) => {
    setError(null);

    try {
      const result = await createTicketAction(data);

      if (result.status === "success") {
        form.reset();
        toast.success(
          "Ticket aberto. A equipe poderá acompanhar sua solicitação.",
        );
        setOpen(false);
        router.refresh();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar ticket");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSubmitting) setOpen(nextOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button type="button">
          <MessageSquarePlus className="mr-2 size-4" />
          Novo ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Abrir ticket de suporte</DialogTitle>
          <DialogDescription>
            Conte o que aconteceu. A equipe de suporte acompanhará a solicitação
            por aqui.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          {(error || formError) && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive"
            >
              {error || formError}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor={subjectId}>Assunto</Label>
            <Input
              id={subjectId}
              {...form.register("subject", { onChange: () => setError(null) })}
              placeholder="Ex.: Erro ao importar planilha"
              disabled={isSubmitting}
              maxLength={200}
              aria-invalid={Boolean(errors.subject)}
            />
            <p
              className="text-right text-xs text-muted-foreground"
              aria-live="polite"
            >
              {subject.length}/200
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={descriptionId}>Descrição</Label>
            <textarea
              id={descriptionId}
              {...form.register("description", {
                onChange: () => setError(null),
              })}
              placeholder="Descreva o problema e os passos que levaram a ele..."
              rows={5}
              maxLength={2000}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.description)}
              className="flex min-h-32 w-full resize-y rounded-xl border border-base-300 bg-base-100 px-3.5 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-2 focus:outline-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p
              className="text-right text-xs text-muted-foreground"
              aria-live="polite"
            >
              {description.length}/2.000
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${subjectId}-priority`}>Prioridade</Label>
            <Select
              id={`${subjectId}-priority`}
              value={priority}
              onValueChange={(value) =>
                form.setValue(
                  "priority",
                  value as CreateTicketInput["priority"],
                  { shouldValidate: true },
                )
              }
              disabled={isSubmitting}
            >
              <SelectTrigger id={`${subjectId}-priority`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(priorityConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isSubmitting ? "Enviando..." : "Abrir ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
