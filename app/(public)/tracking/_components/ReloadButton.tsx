"use client";
import { RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function ReloadButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm min-h-10 shrink-0 gap-2"
      aria-label="Atualizar acompanhamento"
      aria-busy={pending}
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      <RotateCw className="size-4" aria-hidden="true" />
      <span className="hidden sm:inline">
        {pending ? "Atualizando…" : "Atualizar"}
      </span>
    </button>
  );
}
