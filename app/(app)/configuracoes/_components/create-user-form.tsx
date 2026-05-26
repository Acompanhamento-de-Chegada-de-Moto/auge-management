"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2Icon, UserPlus } from "lucide-react";
import { useState } from "react";
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
import {
  type CreateUserInput,
  createUserSchema,
} from "@/validators/create-user-schema";
import { createUserAction } from "../actions";

export function CreateUserForm() {
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
  });

  const onSubmit = async (data: CreateUserInput) => {
    const result = await createUserAction(data);

    if (result.success) {
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError("root", { message: result.error || "Erro desconhecido" });
    }
  };

  return (
    <Card className="border-none bg-secondary/50">
      <CardHeader>
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
          <UserPlus className="size-5 text-primary" />
        </div>
        <CardTitle className="text-center">Criar Novo Usuário</CardTitle>
        <CardDescription className="text-center">
          Registre um novo usuário para acessar o sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
            <CheckCircle2Icon className="size-4" />
            Usuário criado com sucesso!
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {errors.root && (
            <p className="text-sm font-medium text-red-600 text-center">
              {errors.root.message}
            </p>
          )}

          <div className="flex flex-col gap-1">
            <Input
              {...register("name")}
              type="text"
              placeholder="Nome completo"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Input
              {...register("email")}
              type="email"
              placeholder="E-mail"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Input
              {...register("password")}
              type="password"
              placeholder="Senha de acesso"
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Criando usuário..." : "Criar Usuário"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
