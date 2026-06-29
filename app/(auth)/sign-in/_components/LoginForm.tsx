"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, Mail } from "lucide-react";
import Link from "next/link";
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
  const [_emailAndPasswordPending, startEmailAndPasswordTransition] =
    useTransition();

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
        callbackURL: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/bdc`,
      });

      if (result.error) {
        toast.error(
          "Não foi possível fazer login. Verifique suas credenciais e tente novamente.",
        );
      }
    });
  };

  return (
    <Card className="w-full max-w-md border shadow-lg shadow-black/5">
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-xl font-bold">
          Acesse sua conta
        </CardTitle>
        <CardDescription className="text-center">
          Entre com suas credenciais para continuar
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
                placeholder="seu@email.com"
                className="h-12 rounded-xl pl-10"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <span className="cursor-default text-xs font-medium text-primary">
                Esqueceu a senha?
              </span>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                {...register("password")}
                id="password"
                type="password"
                placeholder="Sua senha"
                autoComplete="current-password"
                className="h-12 rounded-xl pl-10"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="h-12 w-full rounded-xl text-base font-semibold shadow-lg shadow-primary/30"
          >
            Entrar na Plataforma
            <ArrowRight className="size-4" />
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-primary hover:underline"
            >
              Crie uma agora
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
