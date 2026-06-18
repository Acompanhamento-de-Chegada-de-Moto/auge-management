"use client";

import { Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
import { tryCatch } from "@/lib/try-catch";
import { DeleteClientAction } from "./actions";

export default function DeleteClientRoute() {
  const { clientId } = useParams<{ clientId: string }>();
  const router = useRouter();

  const [pending, startTransition] = useTransition();

  function onSubmit() {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        DeleteClientAction(clientId),
      );

      if (error) {
        toast.error("Ocorreu um erro inesperado. Por favor, tente novamente.");
        return;
      }

      if (result.status === "success") {
        toast.success(result.message);
        router.push("/bdc");
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="max-w-xl mx-auto w-full">
      <Card className="mt-32">
        <CardHeader>
          <CardTitle>Tem certeza que deseja excluir este cliente?</CardTitle>
          <CardDescription>
            Esta ação não poderá ser desfeita. O vínculo com as motocicletas no
            estoque será removido.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Link
            href="/bdc"
            className={buttonVariants({
              variant: "outline",
            })}
          >
            Cancelar
          </Link>

          <Button variant="destructive" disabled={pending} onClick={onSubmit}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                Excluir Cliente
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
