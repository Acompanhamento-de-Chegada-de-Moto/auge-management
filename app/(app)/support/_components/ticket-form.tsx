"use client";

import { Loader2, MessageSquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTicketAction } from "@/app/(app)/support/actions";

const priorityLabels: Record<string, string> = {
  NORMAL: "Normal",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export function TicketForm() {
  const router = useRouter();
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

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createTicketAction({
        subject: subject.trim(),
        description: description.trim(),
        priority: priority as "NORMAL" | "HIGH" | "URGENT",
      });

      if (result.status === "success") {
        setSubject("");
        setDescription("");
        setPriority("NORMAL");
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor={subjectId}>Assunto</Label>
        <Input
          id={subjectId}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Ex: Erro ao importar planilha"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={descriptionId}>Descrição</Label>
        <textarea
          id={descriptionId}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva o problema com detalhes..."
          rows={5}
          disabled={isSubmitting}
          className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Prioridade</Label>
        <Select
          value={priority}
          onValueChange={setPriority}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(priorityLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <MessageSquarePlus className="mr-2 size-4" />
        )}
        {isSubmitting ? "Enviando..." : "Abrir ticket"}
      </Button>
    </form>
  );
}
