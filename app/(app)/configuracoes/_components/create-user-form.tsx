"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2Icon, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type CreateUserInput,
  createUserSchema,
} from "@/validators/create-user-schema";

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
    // const result = await createUserAction(data);
    // if (result.success) {
    //   setSuccess(true);
    //   reset();
    //   setTimeout(() => setSuccess(false), 3000);
    // } else {
    //   setError("root", { message: result.error || "Erro desconhecido" });
    // }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
          <CheckCircle2Icon className="size-4 shrink-0" />
          Usuário criado com sucesso!
        </div>
      )}

      {errors.root && (
        <p className="text-sm font-medium text-red-600">
          {errors.root.message}
        </p>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Nome</label>
        <Input
          {...register("name")}
          type="text"
          placeholder="Nome completo"
          disabled={isSubmitting}
          className="max-w-sm"
        />
        {errors.name && (
          <p className="text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">E-mail</label>
        <Input
          {...register("email")}
          type="email"
          placeholder="E-mail"
          disabled={isSubmitting}
          className="max-w-sm"
        />
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Senha</label>
        <Input
          {...register("password")}
          type="password"
          placeholder="Senha de acesso"
          autoComplete="new-password"
          disabled={isSubmitting}
          className="max-w-sm"
        />
        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        <UserPlus className="mr-2 size-4" />
        {isSubmitting ? "Criando usuário..." : "Criar Usuário"}
      </Button>
    </form>
  );
}
