"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { auditLoginAction } from "@/app/(auth)/sign-in/actions";
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

      if (!result.error) {
        try {
          await auditLoginAction();
        } catch {
          // Ignora erro de audit — login já foi bem-sucedido
        }
      }
    });
  };

  return (
    <div>
      <Card className="w-full min-w-md border-none bg-secondary/50">
        <CardHeader>
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="size-5 text-primary" />
          </div>
          <CardTitle className="text-center">
            Acesse o painel administrativo
          </CardTitle>
          <CardDescription>
            Faça login com suas credenciais para acessar o painel
            administrativo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <Input {...register("email")} type="email" placeholder="Email" />
              {errors && (
                <p className="text-xs text-red-600">{errors.email?.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Input
                {...register("password")}
                type="password"
                placeholder="Senha de acesso"
                autoComplete="current-password"
              />
              {errors && (
                <p className="text-xs text-red-600">
                  {errors.password?.message}
                </p>
              )}
            </div>
            <Button className="w-full" type="submit">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
