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
import { DeleteMotorcycleAction } from "../actions";

interface DeleteMotorcycleConfirmationProps {
  motorcycle: {
    id: string;
    chassi: string;
    model: string;
  };
}

export function DeleteMotorcycleConfirmation({
  motorcycle,
}: DeleteMotorcycleConfirmationProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        const result = await DeleteMotorcycleAction(motorcycle.id);
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        router.push("/inventory");
        router.refresh();
      } catch {
        toast.error("Não foi possível excluir a motocicleta. Tente novamente.");
      }
    });
  }

  return (
    <Card className="mx-auto mt-8 w-full max-w-xl overflow-hidden sm:mt-16">
      <CardHeader className="border-b bg-destructive/[0.03] p-6 sm:p-8">
        <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" />
        </div>
        <CardTitle>Excluir esta motocicleta?</CardTitle>
        <CardDescription>
          A exclusão é permanente. Confira se esta é a unidade correta antes de
          continuar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="font-medium">{motorcycle.model}</p>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {motorcycle.chassi}
          </p>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link
            href="/inventory"
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
            {isPending ? "Excluindo…" : "Excluir motocicleta"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
