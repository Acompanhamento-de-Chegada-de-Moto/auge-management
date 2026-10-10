"use client";

import { AlignJustify, List, X } from "lucide-react";
import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

/** One composition for operational lists; filtering remains owned by the URL. */
export function DataWorkspace({
  title,
  description,
  total,
  unit,
  busy = false,
  children,
}: {
  title: string;
  description: string;
  total: number;
  unit: string;
  busy?: boolean;
  children: ReactNode;
}) {
  const [compact, setCompact] = useState(false);
  return (
    <div
      className="data-workspace overflow-hidden rounded-xl border border-base-300 bg-base-100"
      data-density={compact ? "compact" : "comfortable"}
      aria-busy={busy}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-300 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold">{title}</h2>
            <span className="badge badge-sm badge-ghost tabular-nums">
              {total.toLocaleString("pt-BR")}
              <span className="sr-only"> {unit}</span>
            </span>
            {busy && (
              <output className="text-xs text-muted-foreground">
                Atualizando…
              </output>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <fieldset className="join hidden md:flex">
          <legend className="sr-only">Densidade da tabela</legend>
          {[
            { compact: false, label: "Confortável", Icon: List },
            { compact: true, label: "Compacta", Icon: AlignJustify },
          ].map(({ compact: value, label, Icon }) => (
            <button
              key={label}
              type="button"
              title={label}
              aria-label={`Densidade ${label.toLowerCase()}`}
              aria-pressed={compact === value}
              onClick={() => setCompact(value)}
              className={cn(
                "btn btn-sm btn-square join-item border-base-300 shadow-none",
                compact === value
                  ? "bg-base-200"
                  : "bg-base-100 text-muted-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </button>
          ))}
        </fieldset>
      </div>
      {children}
    </div>
  );
}

export function ActiveFilters({
  filters,
  disabled,
  onRemove,
}: {
  filters: { key: string; label: string; value: string }[];
  disabled?: boolean;
  onRemove: (key: string) => void;
}) {
  const active = filters.filter((filter) => filter.value);
  if (active.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">Filtrando por</span>
      {active.map((filter) => (
        <button
          key={filter.key}
          type="button"
          disabled={disabled}
          onClick={() => onRemove(filter.key)}
          aria-label={`Remover filtro ${filter.label}: ${filter.value}`}
          className="btn btn-sm h-auto min-h-8 max-w-full border-base-300 bg-base-200 px-2.5 text-xs font-normal shadow-none"
        >
          <span className="truncate">
            {filter.label}:{" "}
            <strong className="font-medium">{filter.value}</strong>
          </span>
          <X className="size-3.5 shrink-0" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
