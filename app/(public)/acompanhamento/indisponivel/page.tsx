"use client";

import { AlertTriangle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function LinkInvalidoOuDeletadoPage() {
  const telefoneSuporte = "5588999999999";
  const mensagemWhats = encodeURIComponent(
    "Olá! Estava acessando o link de acompanhamento da minha motocicleta, mas a página consta como indisponível. Pode me ajudar?",
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="border-muted shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
              <AlertTriangle className="size-6 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight">
              Acompanhamento Indisponível
            </CardTitle>
            <CardDescription className="pt-1">
              Este link de acesso expirou, foi removido ou não está mais ativo
              em nosso sistema.
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center text-sm text-muted-foreground space-y-4">
            <p>
              Não se preocupe! Se a sua motocicleta foi faturada recentemente ou
              o cadastro passou por atualizações, as informações de rastreio
              mudam de endereço.
            </p>
            <p className="font-medium text-foreground">
              Por favor, entre em contato direto com o seu vendedor para receber
              o status atualizado.
            </p>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 pt-2">
            <a
              href={`https://wa.me/${telefoneSuporte}?text=${mensagemWhats}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "default" }),
                "w-full gap-2 font-medium",
              )}
            >
              <MessageSquare className="size-4" />
              Falar com o Vendedor via WhatsApp
            </a>

            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full text-xs text-muted-foreground",
              )}
            >
              Voltar para a página inicial
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
