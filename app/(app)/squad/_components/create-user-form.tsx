"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createUserAction } from "@/app/(app)/squad/actions";
import {
  type CreateUserInput,
  createUserSchema,
} from "@/validators/create-user-schema";
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

export function CreateUserForm() {
  const router = useRouter();
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const roleId = useId();

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
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER",
    },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: CreateUserInput) {
    try {
      const result = await createUserAction(data);

      if (result.status !== "success") {
        setError("root", { message: result.message });
        return;
      }

      toast.success(result.message ?? "Usuário criado com sucesso.");
      reset();
      router.refresh();
    } catch {
      toast.error("Não foi possível criar o usuário.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {errors.root && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {errors.root.message}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor={nameId}>Nome</Label>
        <Input
          id={nameId}
          {...register("name")}
          placeholder="Nome completo"
          autoComplete="name"
          disabled={isSubmitting}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
        />
        {errors.name && (
          <p id={`${nameId}-error`} className="text-sm text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={emailId}>E-mail</Label>
        <Input
          id={emailId}
          {...register("email")}
          type="email"
          placeholder="nome@empresa.com"
          autoComplete="email"
          disabled={isSubmitting}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
        />
        {errors.email && (
          <p id={`${emailId}-error`} className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={passwordId}>Senha</Label>
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
          <p id={`${passwordId}-error`} className="text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={roleId}>Função</Label>
        <Select
          value={selectedRole}
          onValueChange={(value) => {
            if (value === "USER" || value === "MANAGER" || value === "ADMIN") {
              setValue("role", value, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }
          }}
          disabled={isSubmitting}
        >
          <SelectTrigger id={roleId} aria-invalid={!!errors.role}>
            <SelectValue placeholder="Selecione uma função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">Usuário</SelectItem>
            <SelectItem value="MANAGER">Gerente</SelectItem>
            <SelectItem value="ADMIN">Administrador</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-destructive">{errors.role.message}</p>
        )}
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
