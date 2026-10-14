"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

export function CopyValueButton({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <button
      type="button"
      className="inline-flex max-w-full items-center gap-1.5 rounded px-1 py-1 text-left font-mono hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      title={`Copiar ${label}`}
      aria-label={`Copiar ${label}: ${value}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          toast.success(`${label} copiado.`);
        } catch {
          toast.error(`Não foi possível copiar ${label.toLowerCase()}.`);
        }
      }}
    >
      <span className="break-all">{value}</span>
      <Copy className="size-3.5 shrink-0" aria-hidden="true" />
    </button>
  );
}
