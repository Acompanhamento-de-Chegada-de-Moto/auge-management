"use client";

import dayjs from "dayjs";
import { CheckIcon, CopyIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { UserGetMotorcyclesType } from "@/app/data/user/user-get-motorcycles";
import { Button, buttonVariants } from "@/components/ui/button";
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

  if (arrival.isSame(hoje, "day")) {
    return {
      label: "Chegou",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };
  }

  return {
    label: "Atrasada",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
}

interface MotorcycleTableProps {
  motorcycles: UserGetMotorcyclesType[];
}

export default function MotorcycleTable({ motorcycles }: MotorcycleTableProps) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleDelete = async (id: string) => {
    router.refresh();
  };

  return (
    <div className="w-full">
      <div className="rounded-sm border">
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
            {motorcycles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  Nenhuma motocicleta cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              motorcycles.map((motorcycle) => {
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
                        className="group inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs transition-colors"
                        title="Clique para copiar o chassi"
                      >
                        {copiedId === motorcycle.id ? (
                          <>
                            <CheckIcon className="size-3.5 text-green-600 dark:text-green-400" />
                            <span className="text-green-600 dark:text-green-400">
                              Copiado!
                            </span>
                          </>
                        ) : (
                          <>
                            <CopyIcon className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                            <span className="hover:underline">
                              {/* CORRIGIDO: de chassis para chassi */}
                              {motorcycle.chassi}
                            </span>
                          </>
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      {motorcycle.forecastArrival
                        ? new Date(
                            motorcycle.forecastArrival,
                          ).toLocaleDateString("pt-BR")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex h-full items-center gap-1 justify-end">
                        <Link
                          href={`/estoque/motocicleta/${motorcycle.id}/editar`}
                          aria-label={`editar-${motorcycle.id}`}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "icon",
                            className: "rounded-full",
                          })}
                        >
                          <PencilIcon className="size-4" />
                        </Link>
                        <Link
                          href={`/estoque/motocicleta/${motorcycle.id}/deletar`}
                          aria-label={`deletar-${motorcycle.id}`}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "icon",
                            className: "rounded-full",
                          })}
                        >
                          <Trash2Icon className="size-4 text-red-500" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
