"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { type LoginInputType, loginSchema } from "@/validators/login-schema";

export default function LoginForm() {
  const [isPending, startEmailAndPasswordTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputType>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInputType) => {
    startEmailAndPasswordTransition(async () => {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: "/bdc",
      });

      if (result.error) {
        toast.error(
          "Não foi possível fazer login. Verifique suas credenciais e tente novamente.",
        );
      }
    });
  };

  return (
    <Card className="w-full max-w-md border-base-300 bg-base-100 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold tracking-tight">
          Acesse sua conta
        </CardTitle>
        <CardDescription>
          Entre para acessar sua área de trabalho.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                {...register("email")}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                className="h-11 rounded-lg pl-10"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>
            {errors.email && (
              <p
                id="email-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                {...register("password")}
                id="password"
                type="password"
                placeholder="Sua senha"
                autoComplete="current-password"
                className="h-11 rounded-lg pl-10"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
              />
            </div>
            {errors.password && (
              <p
                id="password-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {errors.password.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="h-11 w-full text-sm font-medium"
          >
            {isPending ? "Entrando…" : "Entrar na plataforma"}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
