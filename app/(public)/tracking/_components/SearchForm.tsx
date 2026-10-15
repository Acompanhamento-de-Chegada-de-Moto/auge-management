"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import { maskDocumentIncremental } from "@/lib/document";
import { documentSearchSchema } from "@/validators/document-search-schema";

export function SearchForm({
  defaultValue = "",
  initialError,
}: {
  defaultValue?: string;
  initialError?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof documentSearchSchema>>({
    resolver: zodResolver(documentSearchSchema),
    defaultValues: { document: maskDocumentIncremental(defaultValue) },
  });
  const error =
    form.formState.errors.document?.message ??
    (!form.formState.isDirty ? initialError : undefined);
  return (
    <form
      onSubmit={form.handleSubmit(({ document }) =>
        startTransition(() =>
          router.push(`/tracking?q=${encodeURIComponent(document)}`),
        ),
      )}
      className="space-y-4"
      aria-busy={pending}
    >
      <div className="space-y-2">
        <label htmlFor="tracking-document" className="text-sm font-medium">
          CPF ou CNPJ
        </label>
        <Controller
          control={form.control}
          name="document"
          render={({ field }) => (
            <input
              {...field}
              id="tracking-document"
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              maxLength={18}
              placeholder="Digite o CPF ou CNPJ"
              className="input h-12 w-full font-mono"
              readOnly={pending}
              aria-invalid={!!error}
              aria-describedby={
                error ? "tracking-document-error" : "tracking-document-help"
              }
              onChange={(event) =>
                field.onChange(
                  maskDocumentIncremental(event.currentTarget.value),
                )
              }
            />
          )}
        />
        {error ? (
          <p
            id="tracking-document-error"
            role="alert"
            className="text-xs text-error"
          >
            {error}
          </p>
        ) : (
          <p
            id="tracking-document-help"
            className="text-xs text-base-content/55"
          >
            Use o documento completo informado no cadastro.
          </p>
        )}
      </div>
      <button
        type="submit"
        className="btn btn-primary min-h-12 w-full gap-2"
        disabled={pending}
      >
        <Search className="size-4" aria-hidden="true" />
        {pending ? "Consultando…" : "Consultar motocicleta"}
      </button>
    </form>
  );
}
