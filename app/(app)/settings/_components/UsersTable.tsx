"use client";

import {
  CheckCircle2Icon,
  Loader2,
  Pencil,
  Upload,
  UserPlus,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useId, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { adminGetUsers } from "@/app/data/admin/admin-get-users";
import { updateUserAction } from "@/app/(app)/settings/actions";

type User = Awaited<ReturnType<typeof adminGetUsers>>[number];

interface UsersTableProps {
  users: User[];
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function EditUserDialog({
  user,
  onSaved,
}: {
  user: User;
  onSaved: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [newPassword, setNewPassword] = useState("");
  const [enablePassword, setEnablePassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(user.image ?? null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameId = useId();
  const passwordId = useId();

  const resetForm = useCallback(() => {
    setName(user.name);
    setNewPassword("");
    setEnablePassword(false);
    setImagePreview(user.image ?? null);
    setSelectedFile(null);
    setError(null);
    setSuccess(false);
  }, [user.name, user.image]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Apenas imagens são permitidas");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 2MB");
      return;
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("O nome é obrigatório");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl = user.image ?? "";

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await fetch("/api/upload/avatar", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          setError(err.error ?? "Erro ao fazer upload");
          setIsSubmitting(false);
          return;
        }

        const { url } = await uploadRes.json();
        imageUrl = url;
      }

      const result = await updateUserAction({
        userId: user.id,
        name: name.trim(),
        newPassword: enablePassword && newPassword ? newPassword : "",
        image: imageUrl,
      });

      if (result.status === "success") {
        setSuccess(true);
        router.refresh();
        setTimeout(() => {
          setOpen(false);
          onSaved();
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nowOpen) => {
        setOpen(nowOpen);
        if (!nowOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar usuário</DialogTitle>
          <DialogDescription>Altere nome, senha ou foto do perfil</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {success && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300"
            >
              <CheckCircle2Icon className="size-4 shrink-0" />
              Usuário atualizado com sucesso!
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="size-20">
                {imagePreview ? (
                  <AvatarImage src={imagePreview} alt={name} />
                ) : null}
                <AvatarFallback className="text-lg">
                  {initialsOf(name)}
                </AvatarFallback>
              </Avatar>

              {imagePreview && (
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setSelectedFile(null);
                  }}
                  className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 size-4" />
              {imagePreview ? "Alterar foto" : "Adicionar foto"}
            </Button>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor={nameId} className="text-sm font-medium">
              Nome
            </label>
            <Input
              id={nameId}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Email (readonly) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">E-mail</label>
            <Input value={user.email} disabled readOnly />
          </div>

          {/* Password toggle + input */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <label htmlFor={passwordId} className="text-sm font-medium">
                Nova senha
              </label>
              {!enablePassword && (
                <button
                  type="button"
                  onClick={() => setEnablePassword(true)}
                  className="text-xs text-primary underline"
                >
                  Alterar senha
                </button>
              )}
            </div>

            {enablePassword && (
              <>
                <Input
                  id={passwordId}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nova senha (mín. 6 caracteres)"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => {
                    setEnablePassword(false);
                    setNewPassword("");
                  }}
                  className="text-xs text-muted-foreground underline"
                >
                  Cancelar alteração de senha
                </button>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UsersTable({ users }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-10 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <UserPlus className="size-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Nenhum usuário cadastrado</p>
          <p className="text-xs text-muted-foreground">
            Use o formulário ao lado para criar o primeiro acesso
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <Avatar className="size-9">
              {user.image ? <AvatarImage src={user.image} /> : null}
              <AvatarFallback className="text-xs">
                {initialsOf(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                user.role === "ADMIN"
                  ? "border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  : "border-gray-200 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
              }
            >
              {user.role}
            </Badge>
            <EditUserDialog user={user} onSaved={() => {}} />
          </div>
        ))}
      </div>

      <div className="hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Usuário</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      {user.image ? <AvatarImage src={user.image} /> : null}
                      <AvatarFallback className="text-xs">
                        {initialsOf(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-tight">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      user.role === "ADMIN"
                        ? "border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        : "border-gray-200 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                    }
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>
                  <EditUserDialog user={user} onSaved={() => {}} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
