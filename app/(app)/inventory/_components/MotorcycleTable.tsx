"use client";

import {
  Bike,
  CheckIcon,
  ChevronLeft,
  ChevronRight,
  CopyIcon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getArrivalStatus } from "@/lib/bdc-data";
import { formatDateBR } from "@/lib/utils";

interface MotorcycleRow {
  id: string;
  chassi: string;
  model: string;
  forecastArrival: Date | null;
  forecastArrivalStatus: string | null;
}

interface MotorcycleTableProps {
  motorcycles: MotorcycleRow[];
  total: number;
  totalPages: number;
  page: number;
  statusCounts: {
    total: number;
    inTransit: number;
    arrived: number;
    delayed: number;
  };
  filterOptions: { models: string[] };
  activeFilters: {
    model: string;
    status: string;
    chassis: string;
  };
}

const statusViews = [
  { label: "Todas", value: "all", countKey: "total" },
  { label: "Em trânsito", value: "Em Trânsito", countKey: "inTransit" },
  { label: "Chegou", value: "Chegou", countKey: "arrived" },
  { label: "Atrasadas", value: "Atrasada", countKey: "delayed" },
] as const;

export default function MotorcycleTable({
  motorcycles,
  total,
  totalPages,
  page,
  statusCounts,
  filterOptions,
  activeFilters,
}: MotorcycleTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [chassisInput, setChassisInput] = useState(activeFilters.chassis);

  function navigate(updates: Record<string, string | null>, resetPage = true) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
    }
    if (resetPage) params.delete("page");
    startTransition(() => {
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  }

  function clearFilters() {
    setChassisInput("");
    startTransition(() => router.replace(pathname));
  }

  function copyChassis(motorcycle: MotorcycleRow) {
    void navigator.clipboard.writeText(motorcycle.chassi).then(() => {
      setCopiedId(motorcycle.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    });
  }

  function renderChassis(motorcycle: MotorcycleRow) {
    const copied = copiedId === motorcycle.id;
    return (
      <button
        type="button"
        onClick={() => copyChassis(motorcycle)}
        aria-label={
          copied ? "Chassi copiado" : `Copiar chassi ${motorcycle.chassi}`
        }
        className="inline-flex min-h-11 items-center gap-2 rounded-md font-mono text-xs text-muted-foreground hover:text-foreground"
      >
        {copied ? (
          <>
            <CheckIcon className="size-3.5 text-green-600" />
            <span role="status">Copiado</span>
          </>
        ) : (
          <>
            <CopyIcon className="size-3.5" />
            <span>{motorcycle.chassi}</span>
          </>
        )}
      </button>
    );
  }

  function renderActions(motorcycle: MotorcycleRow) {
    return (
      <div className="flex items-center justify-end gap-1">
        <Link
          href={`/inventory/motorcycle/${motorcycle.id}/edit`}
          aria-label={`Editar ${motorcycle.model}`}
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "min-h-10",
          })}
        >
          <PencilIcon className="mr-2 size-4" />
          <span className="hidden lg:inline">Editar</span>
        </Link>
        <Link
          href={`/inventory/motorcycle/${motorcycle.id}/delete`}
          aria-label={`Excluir ${motorcycle.model}`}
          className={buttonVariants({
            variant: "ghost",
            size: "icon",
            className: "min-h-10 min-w-10 text-destructive",
          })}
        >
          <Trash2Icon className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {statusViews.map((view) => {
          const selected = (activeFilters.status || "all") === view.value;
          return (
            <button
              key={view.value}
              type="button"
              aria-pressed={selected}
              onClick={() => navigate({ status: view.value, arrived: null })}
              disabled={isPending}
              className={`flex min-h-16 items-center justify-between rounded-xl border px-4 text-left transition-colors ${
                selected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "bg-card hover:bg-muted/50"
              }`}
            >
              <span
                className={`text-sm ${selected ? "font-medium text-foreground" : "text-muted-foreground"}`}
              >
                {view.label}
              </span>
              <span className="text-lg font-semibold tabular-nums">
                {statusCounts[view.countKey]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar pelo chassi"
            value={chassisInput}
            onChange={(event) => setChassisInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter")
                navigate({ chassis: chassisInput.trim() });
            }}
            className="pl-9 pr-9"
            disabled={isPending}
          />
          {chassisInput && (
            <button
              type="button"
              onClick={() => {
                setChassisInput("");
                navigate({ chassis: null });
              }}
              aria-label="Limpar busca"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>
        <Select
          value={activeFilters.model || "all"}
          onValueChange={(value) => navigate({ model: value })}
          disabled={isPending}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Todos os modelos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os modelos</SelectItem>
            {filterOptions.models.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => navigate({ chassis: chassisInput.trim() })}
          disabled={isPending}
        >
          Buscar
        </Button>
        {(activeFilters.model ||
          activeFilters.status ||
          activeFilters.chassis) && (
          <Button variant="ghost" onClick={clearFilters} disabled={isPending}>
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {total} {total === 1 ? "motocicleta" : "motocicletas"}
        </span>
        {isPending && <span role="status">Atualizando lista…</span>}
      </div>

      {motorcycles.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-14 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Bike className="size-5" />
          </div>
          <h2 className="font-medium">
            Nenhuma motocicleta nesta visualização
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Ajuste os filtros ou cadastre uma motocicleta para começar a
            acompanhar o estoque.
          </p>
          {(activeFilters.model ||
            activeFilters.status ||
            activeFilters.chassis) && (
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Limpar filtros
            </Button>
          )}
        </div>
      ) : (
        <div
          className={
            isPending ? "pointer-events-none opacity-60 transition-opacity" : ""
          }
        >
          <div className="space-y-3 md:hidden">
            {motorcycles.map((motorcycle) => {
              const status = getArrivalStatus(
                motorcycle.forecastArrival,
                motorcycle.forecastArrivalStatus,
              );
              return (
                <article
                  key={motorcycle.id}
                  className="rounded-xl border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-medium">
                        {motorcycle.model}
                      </h3>
                      {renderChassis(motorcycle)}
                    </div>
                    {renderActions(motorcycle)}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                    <span className="text-sm text-muted-foreground">
                      Previsão:{" "}
                      {formatDateBR(motorcycle.forecastArrival) ?? "Sem data"}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Motocicleta</TableHead>
                  <TableHead>Chassi</TableHead>
                  <TableHead>Previsão de chegada</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {motorcycles.map((motorcycle) => {
                  const status = getArrivalStatus(
                    motorcycle.forecastArrival,
                    motorcycle.forecastArrivalStatus,
                  );
                  return (
                    <TableRow key={motorcycle.id}>
                      <TableCell className="font-medium">
                        {motorcycle.model}
                      </TableCell>
                      <TableCell>{renderChassis(motorcycle)}</TableCell>
                      <TableCell>
                        {formatDateBR(motorcycle.forecastArrival) ?? "Sem data"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </TableCell>
                      <TableCell>{renderActions(motorcycle)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="Paginação do estoque"
              className="flex items-center justify-center gap-4 border-t py-4"
            >
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isPending}
                onClick={() => navigate({ page: String(page - 1) }, false)}
              >
                <ChevronLeft className="mr-1 size-4" /> Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isPending}
                onClick={() => navigate({ page: String(page + 1) }, false)}
              >
                Próxima <ChevronRight className="ml-1 size-4" />
              </Button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
