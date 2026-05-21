"use client";

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

const items = [
  {
    id: "1",
    cliente: "João Silva",
    vendedor: "Carlos Mendes",
    cidade: "São Paulo",
    modelo: "Honda Civic EXL",
    chassi: "9BWHE21JX24060961",
    faturamento: "R$ 142.900,00",
    chegada: "Transportadora Sul",
    dataChegada: "15/03/2025",
    situacao: "Disponível",
  },
  {
    id: "2",
    cliente: "Maria Oliveira",
    vendedor: "Ana Paula Costa",
    cidade: "Rio de Janeiro",
    modelo: "Toyota Corolla XEI",
    chassi: "3VWFE21C4YM543210",
    faturamento: "R$ 138.500,00",
    chegada: "Transportadora Norte",
    dataChegada: "18/03/2025",
    situacao: "Reservado",
  },
  {
    id: "3",
    cliente: "Pedro Santos",
    vendedor: "Carlos Mendes",
    cidade: "Belo Horizonte",
    modelo: "Jeep Compass Limited",
    chassi: "1FTFW1EF7EKG12345",
    faturamento: "R$ 185.000,00",
    chegada: "Transportadora Sul",
    dataChegada: "20/03/2025",
    situacao: "Vendido",
  },
  {
    id: "4",
    cliente: "Fernanda Lima",
    vendedor: "Roberto Almeida",
    cidade: "Curitiba",
    modelo: "Hyundai Creta Platinum",
    chassi: "5NPEB4AC8BH123456",
    faturamento: "R$ 128.700,00",
    chegada: "Transportadora Centro",
    dataChegada: "22/03/2025",
    situacao: "Disponível",
  },
  {
    id: "5",
    cliente: "Lucas Pereira",
    vendedor: "Ana Paula Costa",
    cidade: "Porto Alegre",
    modelo: "Volkswagen T-Cross Highline",
    chassi: "WVGZZZ5NZAW123456",
    faturamento: "R$ 152.300,00",
    chegada: "Transportadora Sul",
    dataChegada: "25/03/2025",
    situacao: "Em Trânsito",
  },
  {
    id: "6",
    cliente: "Camila Rodrigues",
    vendedor: "Roberto Almeida",
    cidade: "Salvador",
    modelo: "Chevrolet Tracker Premier",
    chassi: "3GNDA13D76S123456",
    faturamento: "R$ 119.900,00",
    chegada: "Transportadora Nordeste",
    dataChegada: "28/03/2025",
    situacao: "Disponível",
  },
  {
    id: "7",
    cliente: "Rafael Souza",
    vendedor: "Carlos Mendes",
    cidade: "São Paulo",
    modelo: "BMW 320i Sport",
    chassi: "WBA3B1C51DF123456",
    faturamento: "R$ 245.000,00",
    chegada: "Transportadora Premium",
    dataChegada: "01/04/2025",
    situacao: "Reservado",
  },
  {
    id: "8",
    cliente: "Juliana Martins",
    vendedor: "Ana Paula Costa",
    cidade: "Campinas",
    modelo: "Mercedes-Benz A200",
    chassi: "WDD1770431J123456",
    faturamento: "R$ 198.500,00",
    chegada: "Transportadora Premium",
    dataChegada: "05/04/2025",
    situacao: "Disponível",
  },
  {
    id: "9",
    cliente: "Marcos Duarte",
    vendedor: "Roberto Almeida",
    cidade: "Brasília",
    modelo: "Ford Bronco Wildtrak",
    chassi: "1FMCU0F60LUA12345",
    faturamento: "R$ 320.000,00",
    chegada: "Transportadora Centro",
    dataChegada: "08/04/2025",
    situacao: "Vendido",
  },
  {
    id: "10",
    cliente: "Patrícia Gomes",
    vendedor: "Carlos Mendes",
    cidade: "Florianópolis",
    modelo: "BYD Dolphin Plus",
    chassi: "LGXCG4DG9N1234567",
    faturamento: "R$ 168.900,00",
    chegada: "Transportadora Sul",
    dataChegada: "10/04/2025",
    situacao: "Em Trânsito",
  },
];

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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

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
            {items.map((item) => (
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
