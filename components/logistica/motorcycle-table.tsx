"use client";

import { useRouter } from "next/navigation";
import { CheckIcon, CopyIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteMotorcycleAction } from "@/app/(app)/logistica/actions";

interface MotorcycleRow {
  id: string;
  model: string;
  chassis: string;
  arrivalDate: Date | null;
}

interface MotorcycleTableProps {
  motorcycles: MotorcycleRow[];
}

function getStatusChegada(arrivalDate: Date | null) {
  if (!arrivalDate) {
    return {
      label: "Em Trânsito",
      color:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    };
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const chegada = new Date(arrivalDate);
  chegada.setHours(0, 0, 0, 0);

  if (chegada <= hoje) {
    return {
      label: "Chegou",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };
  }

  return {
    label: "Em Trânsito",
    color:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  };
}

export default function MotorcycleTable({ motorcycles }: MotorcycleTableProps) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const handleDelete = async (id: string) => {
    await deleteMotorcycleAction(id);
  };

  return (
    <div className="w-full">
      <div className="rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Modelo</TableHead>
              <TableHead>Chassi</TableHead>
              <TableHead>Data Chegada</TableHead>
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
              motorcycles.map((moto) => {
                const status = getStatusChegada(moto.arrivalDate);
                return (
                  <TableRow key={moto.id}>
                    <TableCell className="font-medium">{moto.model}</TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => handleCopy(moto.chassis, moto.id)}
                        className="group inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs transition-colors"
                        title="Clique para copiar o chassi"
                      >
                        {copiedId === moto.id ? (
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
                              {moto.chassis}
                            </span>
                          </>
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      {moto.arrivalDate
                        ? new Date(moto.arrivalDate).toLocaleDateString("pt-BR")
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                          aria-label={`editar-${moto.id}`}
                          onClick={() =>
                            router.push(
                              `/logistica/motocicleta/editar?id=${moto.id}`,
                            )
                          }
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                          aria-label={`deletar-${moto.id}`}
                          onClick={() => handleDelete(moto.id)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-muted-foreground mt-4 text-center text-sm">
        Controle de Estoque — Motocicletas
      </p>
    </div>
  );
}
