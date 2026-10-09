"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { updateUserAction } from "@/app/(app)/squad/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { initialsOf } from "@/lib/utils";
import { UserComponentProps } from "../types";

interface EditUserDialogProps extends UserComponentProps {
  trigger?: ReactNode;
}

export function EditUserDialog({ user, trigger }: EditUserDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [newPassword, setNewPassword] = useState("");
  const [enablePassword, setEnablePassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    user.image ?? null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameId = useId();
  const passwordId = useId();

  function releasePreviewUrl() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }

  function resetForm() {
    releasePreviewUrl();
    setName(user.name);
    setNewPassword("");
    setEnablePassword(false);
    setImagePreview(user.image ?? null);
    setSelectedFile(null);
    setError(null);
    setSuccess(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, user.id, user.name, user.image]);

  useEffect(() => {
    return () => {
      releasePreviewUrl();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem válido.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 2 MB.");
      event.target.value = "";
      return;
    }

    releasePreviewUrl();

    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;

    setSelectedFile(file);
    setImagePreview(previewUrl);
    setError(null);
  }

  function handleRemoveImage() {
    releasePreviewUrl();
    setImagePreview(null);
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("O nome é obrigatório.");
      return;
    }

    if (enablePassword && newPassword.length > 0 && newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl = imagePreview === null ? "" : (user.image ?? "");

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadResponse = await fetch("/api/upload/avatar", {
          method: "POST",
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(
            uploadResult.error ?? "Não foi possível enviar a foto.",
          );
        }

        imageUrl = uploadResult.url;
      }

      const result = await updateUserAction({
        userId: user.id,
        name: name.trim(),
        newPassword: enablePassword ? newPassword : "",
        image: imageUrl,
      });

      if (result.status !== "success") {
        setError(result.message);
        return;
      }

      setSuccess(true);
      router.refresh();

      timeoutRef.current = setTimeout(() => {
        setOpen(false);
      }, 900);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível atualizar o usuário.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isSubmitting) return;

        setOpen(nextOpen);

        if (!nextOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={`Editar usuário ${user.name}`}
          >
            Editar
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar usuário</DialogTitle>
          <DialogDescription>
            Atualize as informações do perfil e as configurações de segurança.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
            >
              <CheckCircle2 className="size-4 shrink-0" />
              Usuário atualizado com sucesso.
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <UserRound className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Perfil</h3>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-lg border bg-muted/20 p-4 sm:flex-row">
              <div className="relative">
                <Avatar className="size-16">
                  {imagePreview && (
                    <AvatarImage src={imagePreview} alt={name || user.name} />
                  )}
                  <AvatarFallback>{initialsOf(name)}</AvatarFallback>
                </Avatar>

                {imagePreview && (
                  <button
                    type="button"
                    aria-label="Remover foto do perfil"
                    disabled={isSubmitting}
                    onClick={handleRemoveImage}
                    className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-col items-center gap-1 sm:items-start">
                <p className="text-sm font-medium">Foto do perfil</p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG ou outro formato de imagem. Máximo de 2 MB.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  aria-label="Selecionar foto do perfil"
                  onChange={handleFileSelect}
                  disabled={isSubmitting}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                >
                  <Upload className="mr-2 size-4" />
                  {imagePreview ? "Alterar foto" : "Adicionar foto"}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor={nameId} className="text-sm font-medium">
                Nome completo
              </label>
              <Input
                id={nameId}
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                maxLength={120}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="text-sm font-medium"
                htmlFor={`${nameId}-email`}
              >
                E-mail
              </label>
              <Input
                id={`${nameId}-email`}
                value={user.email}
                readOnly
                disabled
              />
              <p className="text-xs text-muted-foreground">
                O e-mail não pode ser alterado por esta tela.
              </p>
            </div>
          </section>

          <section className="space-y-4 border-t pt-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Segurança</h3>
            </div>

            {!enablePassword ? (
              <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Senha</p>
                  <p className="text-xs text-muted-foreground">
                    A senha atual será mantida.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEnablePassword(true)}
                  disabled={isSubmitting}
                >
                  Alterar senha
                </Button>
              </div>
            ) : (
              <div className="space-y-2 rounded-lg border p-3">
                <label htmlFor={passwordId} className="text-sm font-medium">
                  Nova senha
                </label>
                <Input
                  id={passwordId}
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="Mínimo de 6 caracteres"
                  minLength={6}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  onClick={() => {
                    setEnablePassword(false);
                    setNewPassword("");
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar alteração de senha
                </button>
              </div>
            )}
          </section>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || success}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
