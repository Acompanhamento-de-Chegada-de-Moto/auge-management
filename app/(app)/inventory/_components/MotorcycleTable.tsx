"use client";

import dayjs from "dayjs";
import { CheckIcon, CopyIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { UserGetMotorcyclesType } from "@/app/data/user/user-get-motorcycles";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function getArrivalStatus(forecastDate: Date | null) {
  if (!forecastDate) {
    return {
      label: "Em Trânsito",
      color:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    };
  }

  const hoje = dayjs().startOf("day");
  const arrival = dayjs(forecastDate).startOf("day");

  if (arrival.isAfter(hoje)) {
    return {
      label: "Em Trânsito",
      color:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    };
  }

  return {
    label: "Chegou",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  };
}

interface MotorcycleTableProps {
  motorcycles: UserGetMotorcyclesType[];
}

export default function MotorcycleTable({ motorcycles }: MotorcycleTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  if (motorcycles.length === 0) {
    return (
      <div className="rounded-sm border py-8 text-center text-muted-foreground">
        Nenhuma motocicleta cadastrada.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* MOBILE: cards (abaixo de md) */}
      <div className="space-y-3 md:hidden">
        {motorcycles.map((motorcycle) => {
          const status = getArrivalStatus(motorcycle.forecastArrival);
          return (
            <div key={motorcycle.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{motorcycle.model}</p>
                  <button
                    type="button"
                    onClick={() => handleCopy(motorcycle.chassi, motorcycle.id)}
                    aria-label={`Copiar chassi ${motorcycle.chassi}`}
                    className="group mt-1 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground"
                  >
                    {copiedId === motorcycle.id ? (
                      <span
                        role="status"
                        className="flex items-center gap-1 text-green-600 dark:text-green-400"
                      >
                        <CheckIcon className="size-3.5" />
                        Copiado!
                      </span>
                    ) : (
                      <>
                        <CopyIcon className="size-3.5" />
                        <span className="underline">{motorcycle.chassi}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex gap-1">
                  <Link
                    href={`/inventory/motorcycle/${motorcycle.id}/edit`}
                    aria-label={`Editar motocicleta ${motorcycle.model}`}
                    className={buttonVariants({
                      variant: "ghost",
                      size: "icon",
                      className: "rounded-full min-h-[44px] min-w-[44px]",
                    })}
                  >
                    <PencilIcon className="size-4" />
                  </Link>
                  <Link
                    href={`/inventory/motorcycle/${motorcycle.id}/delete`}
                    aria-label={`Excluir motocicleta ${motorcycle.model}`}
                    className={buttonVariants({
                      variant: "ghost",
                      size: "icon",
                      className: "rounded-full min-h-[44px] min-w-[44px]",
                    })}
                  >
                    <Trash2Icon className="size-4 text-red-500" />
                  </Link>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t pt-2">
                <span className="text-xs text-muted-foreground">
                  Previsão:{" "}
                  {motorcycle.forecastArrival
                    ? new Date(motorcycle.forecastArrival).toLocaleDateString(
                        "pt-BR",
                      )
                    : "—"}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${status.color}`}
                >
                  {status.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP: tabela (md e acima) */}
      <div className="hidden rounded-sm border shadow-sm md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Modelo</TableHead>
              <TableHead>Chassi</TableHead>
              <TableHead>Previsão de Chegada</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-0 pr-4 text-end">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {motorcycles.map((motorcycle) => {
              const status = getArrivalStatus(motorcycle.forecastArrival);
              return (
                <TableRow key={motorcycle.id}>
                  <TableCell className="font-medium">
                    {motorcycle.model}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(motorcycle.chassi, motorcycle.id)
                      }
                      className="group inline-flex items-center gap-1.5 font-mono text-xs transition-colors min-h-[44px]"
                      title="Clique para copiar o chassi"
                    >
                      {copiedId === motorcycle.id ? (
                        <>
                          <CheckIcon className="size-3.5 text-green-600 dark:text-green-400" />
                          <span
                            role="status"
                            className="text-green-600 dark:text-green-400"
                          >
                            Copiado!
                          </span>
                        </>
                      ) : (
                        <>
                          <CopyIcon className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                          <span className="hover:underline">
                            {motorcycle.chassi}
                          </span>
                        </>
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    {motorcycle.forecastArrival
                      ? new Date(motorcycle.forecastArrival).toLocaleDateString(
                          "pt-BR",
                        )
                      : "—"}
                  </TableCell>
                  <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${status.color}`}
                  >
                    {status.label}
                  </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex h-full items-center gap-1 justify-end">
                      <Link
                        href={`/inventory/motorcycle/${motorcycle.id}/edit`}
                        aria-label={`editar-${motorcycle.id}`}
                        className={buttonVariants({
                          variant: "ghost",
                          size: "icon",
                          className: "rounded-full min-h-[44px] min-w-[44px]",
                        })}
                      >
                        <PencilIcon className="size-4" />
                      </Link>
                      <Link
                        href={`/inventory/motorcycle/${motorcycle.id}/delete`}
                        aria-label={`deletar-${motorcycle.id}`}
                        className={buttonVariants({
                          variant: "ghost",
                          size: "icon",
                          className: "rounded-full min-h-[44px] min-w-[44px]",
                        })}
                      >
                        <Trash2Icon className="size-4 text-red-500" />
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
