"use client";

import { Loader2, MessageSquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";
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
import { apiMutation } from "@/lib/api/client";
import { priorityConfig } from "./tickets-config";

export function TicketForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subjectId = useId();
  const descriptionId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      setError("Assunto é obrigatório");
      return;
    }

    if (!description.trim()) {
      setError("Descrição é obrigatória");
      return;
    }

    if (subject.trim().length > 200) {
      setError("O assunto deve ter no máximo 200 caracteres.");
      return;
    }

    if (description.trim().length > 2000) {
      setError("A descrição deve ter no máximo 2.000 caracteres.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await apiMutation("/api/v1/support/tickets", "POST", {
        subject: subject.trim(),
        description: description.trim(),
        priority: priority as "NORMAL" | "HIGH" | "URGENT",
      });

      if (result.status === "success") {
        setSubject("");
        setDescription("");
        setPriority("NORMAL");
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
    } finally {
      setIsSubmitting(false);
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
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive"
            >
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor={subjectId}>Assunto</Label>
            <Input
              id={subjectId}
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setError(null);
              }}
              placeholder="Ex.: Erro ao importar planilha"
              disabled={isSubmitting}
              maxLength={200}
              aria-invalid={Boolean(error && !subject.trim())}
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
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError(null);
              }}
              placeholder="Descreva o problema e os passos que levaram a ele..."
              rows={5}
              maxLength={2000}
              disabled={isSubmitting}
              aria-invalid={Boolean(error && !description.trim())}
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
              onValueChange={setPriority}
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
