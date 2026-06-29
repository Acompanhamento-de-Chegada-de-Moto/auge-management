"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2Icon, Loader2, UserPlus } from "lucide-react";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
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
import {
  type CreateUserInput,
  createUserSchema,
} from "@/validators/create-user-schema";
import { createUserAction } from "@/app/(app)/settings/actions";

export function CreateUserForm() {
  const [success, setSuccess] = useState(false);
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: "USER" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: CreateUserInput) => {
    const result = await createUserAction(data);

    if (result.status === "success") {
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError("root", { message: result.message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {success && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300"
        >
          <CheckCircle2Icon className="size-4 shrink-0" />
          Usuário criado com sucesso!
        </div>
      )}

      {errors.root && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {errors.root.message}
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor={nameId} className="text-sm font-medium">
          Nome
        </label>
        <Input
          id={nameId}
          {...register("name")}
          type="text"
          placeholder="Nome completo"
          disabled={isSubmitting}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
        />
        {errors.name && (
          <p id={`${nameId}-error`} className="text-xs text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={emailId} className="text-sm font-medium">
          E-mail
        </label>
        <Input
          id={emailId}
          {...register("email")}
          type="email"
          placeholder="nome@empresa.com"
          disabled={isSubmitting}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
        />
        {errors.email && (
          <p id={`${emailId}-error`} className="text-xs text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={passwordId} className="text-sm font-medium">
          Senha
        </label>
        <Input
          id={passwordId}
          {...register("password")}
          type="password"
          placeholder="Senha de acesso"
          autoComplete="new-password"
          disabled={isSubmitting}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? `${passwordId}-error` : undefined}
        />
        {errors.password && (
          <p id={`${passwordId}-error`} className="text-xs text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Função</Label>
        <Select
          value={selectedRole}
          onValueChange={(v) => setValue("role", v as "USER" | "MANAGER" | "ADMIN")}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">Usuário</SelectItem>
            <SelectItem value="MANAGER">Gerente</SelectItem>
            <SelectItem value="ADMIN">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <UserPlus className="mr-2 size-4" />
        )}
        {isSubmitting ? "Criando..." : "Criar usuário"}
      </Button>
    </form>
  );
}
