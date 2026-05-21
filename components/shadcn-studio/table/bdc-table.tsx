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
import {
  getStatusChegada,
  mapRegistrationStatusLabel,
  getSituacaoColor,
} from "@/lib/bdc-data";
import { deleteClientAction } from "@/app/(app)/bdc/actions";

interface MotorcycleRow {
  id: string;
  model: string;
  chassis: string;
  arrivalDate: Date | null;
  registrationStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

interface ClientRow {
  id: string;
  name: string;
  sellerName: string;
  city: string;
  billingDate: Date | null;
  motorcycles: MotorcycleRow[];
}

interface BDCTableProps {
  clients: ClientRow[];
}

const BDCTable = ({ clients }: BDCTableProps) => {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const handleEdit = (id: string) => {
    router.push(`/bdc/cliente/editar?id=${id}`);
  };

  const handleDelete = async (id: string) => {
    await deleteClientAction(id);
  };

  // Achatamos clients em linhas de moto (uma linha por moto)
  const rows: Array<{
    id: string;
    clientId: string;
    cliente: string;
    vendedor: string;
    cidade: string;
    modelo: string;
    chassi: string;
    dataFaturamento: string;
    dataChegada: Date | null;
    situacao: "Pendente" | "Em Emplacamento" | "Emplacado";
  }> = clients.flatMap((client) =>
    client.motorcycles.length > 0
      ? client.motorcycles.map((moto) => ({
          id: `${client.id}-${moto.id}`,
          clientId: client.id,
          cliente: client.name,
          vendedor: client.sellerName,
          cidade: client.city,
          modelo: moto.model,
          chassi: moto.chassis,
          dataFaturamento: client.billingDate
            ? new Date(client.billingDate).toLocaleDateString("pt-BR")
            : "—",
          dataChegada: moto.arrivalDate,
          situacao: mapRegistrationStatusLabel(moto.registrationStatus),
        }))
      : [
          {
            id: client.id,
            clientId: client.id,
            cliente: client.name,
            vendedor: client.sellerName,
            cidade: client.city,
            modelo: "—",
            chassi: "—",
            dataFaturamento: client.billingDate
              ? new Date(client.billingDate).toLocaleDateString("pt-BR")
              : "—",
            dataChegada: null,
            situacao: "Pendente" as const,
          },
        ],
  );

  return (
    <div className="w-full">
      <div className="rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Cliente</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Chassi</TableHead>
              <TableHead>Data Faturamento</TableHead>
              <TableHead>Status Chegada</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="w-0 pr-4 text-end">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((item) => {
              const statusChegada = getStatusChegada(item.dataChegada);
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.cliente}</TableCell>
                  <TableCell>{item.vendedor}</TableCell>
                  <TableCell>{item.cidade}</TableCell>
                  <TableCell>{item.modelo}</TableCell>
                  <TableCell>
                    {item.chassi !== "—" ? (
                      <button
                        type="button"
                        onClick={() => handleCopy(item.chassi, item.id)}
                        className="group inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs transition-colors"
                        title="Clique para copiar o chassi"
                      >
                        {copiedId === item.id ? (
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
                              {item.chassi}
                            </span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{item.dataFaturamento}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusChegada.color}`}
                    >
                      {statusChegada.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getSituacaoColor(item.situacao)}`}
                    >
                      {item.situacao}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex h-full items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        aria-label={`editar-${item.clientId}`}
                        onClick={() => handleEdit(item.clientId)}
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        aria-label={`deletar-${item.clientId}`}
                        onClick={() => handleDelete(item.clientId)}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <p className="text-muted-foreground mt-4 text-center text-sm">
        Tabela BDC - Controle de Veículos
      </p>
    </div>
  );
};

export default BDCTable;
