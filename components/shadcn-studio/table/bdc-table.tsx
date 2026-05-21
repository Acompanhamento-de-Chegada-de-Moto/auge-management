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
import { bdcItems } from "@/lib/bdc-data";

function getSituacaoColor(situacao: string) {
  switch (situacao) {
    case "Disponível":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "Reservado":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "Vendido":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "Em Trânsito":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
  }
}

const BDCTable = () => {
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
              <TableHead>Faturamento</TableHead>
              <TableHead>Chegada</TableHead>
              <TableHead>Data Chegada</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="w-0 pr-4 text-end">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bdcItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.cliente}</TableCell>
                <TableCell>{item.vendedor}</TableCell>
                <TableCell>{item.cidade}</TableCell>
                <TableCell>{item.modelo}</TableCell>
                <TableCell>
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
                        <span className="hover:underline">{item.chassi}</span>
                      </>
                    )}
                  </button>
                </TableCell>
                <TableCell>{item.faturamento}</TableCell>
                <TableCell>{item.chegada}</TableCell>
                <TableCell>{item.dataChegada}</TableCell>
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
                      aria-label={`editar-${item.id}`}
                      onClick={() => handleEdit(item.id)}
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      aria-label={`deletar-${item.id}`}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
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
