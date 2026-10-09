"use client";

import { AlertTriangle, LoaderCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCPF } from "@/lib/cpf";
import { apiMutation } from "@/lib/api/client";

interface DeleteClientConfirmationProps {
  client: {
    id: string;
    name: string;
    cpf: string;
    sellersName: string;
    motorcycles: Array<{ id: string; model: string; chassi: string }>;
  };
}

export function DeleteClientConfirmation({
  client,
}: DeleteClientConfirmationProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        const result = await apiMutation(
          `/api/v1/bdc/clients/${client.id}`,
          "DELETE",
        );
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        router.push("/bdc");
        router.refresh();
      } catch {
        toast.error("Não foi possível excluir o cliente. Tente novamente.");
      }
    });
  }

  return (
    <Card className="mx-auto mt-8 w-full max-w-xl overflow-hidden sm:mt-16">
      <CardHeader className="border-b bg-destructive/[0.03] p-6 sm:p-8">
        <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" />
        </div>
        <CardTitle>Excluir este cliente?</CardTitle>
        <CardDescription>
          O vínculo com as motocicletas será removido. Confira os dados antes de
          continuar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 p-6 sm:p-8">
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="font-medium">{client.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            CPF {formatCPF(client.cpf)} · Vendedor {client.sellersName}
          </p>
        </div>

        {client.motorcycles.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-medium">
              Motocicletas vinculadas ({client.motorcycles.length})
            </h2>
            <ul className="space-y-2">
              {client.motorcycles.map((motorcycle) => (
                <li
                  key={motorcycle.id}
                  className="flex flex-col justify-between gap-1 rounded-lg border px-3 py-2 text-sm sm:flex-row sm:items-center"
                >
                  <span>{motorcycle.model || "Modelo não informado"}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {motorcycle.chassi}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link
            href="/bdc"
            aria-disabled={isPending}
            className={buttonVariants({ variant: "outline" })}
          >
            Cancelar
          </Link>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
          >
            {isPending ? (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 size-4" />
            )}
            {isPending ? "Excluindo…" : "Excluir cliente"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
