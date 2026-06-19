"use client";

import { format } from "date-fns";
import { PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition } from "react";
import type { UserGetClientsType } from "@/app/data/user/user-get-clients";
import { CopyText } from "@/components/general/CopyText";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { mapRegistrationStatusLabel } from "@/lib/bdc-data";
import { formatCPF } from "@/lib/cpf";

interface IBDCTableProps {
  data: UserGetClientsType[];
  filters: {
    sellerName: string;
    city: string;
    model: string;
  };
}

export function BDCTable({ data, filters }: IBDCTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  const sellers = useMemo(
    () => [...new Set(data.map((item) => item.sellersName).filter(Boolean))],
    [data],
  );

  const cities = useMemo(
    () => [...new Set(data.map((item) => item.city).filter(Boolean))],
    [data],
  );

  const models = useMemo(
    () => [
      ...new Set(
        data.flatMap((item) =>
          item.motorcycles
            .map((motorcycle) => motorcycle.model)
            .filter(Boolean),
        ),
      ),
    ],
    [data],
  );

  const updateFilter = (
    key: "sellerName" | "city" | "model",
    value: string,
  ) => {
    const params = new URLSearchParams(searchParams);

    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.replace(pathname);
    });
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          value={filters.sellerName || "all"}
          onValueChange={(value) => updateFilter("sellerName", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Vendedor" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Todos os vendedores</SelectItem>

            {sellers.map((seller) => (
              <SelectItem key={seller} value={seller}>
                {seller}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.city || "all"}
          onValueChange={(value) => updateFilter("city", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Cidade" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Todas as cidades</SelectItem>

            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.model || "all"}
          onValueChange={(value) => updateFilter("model", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Modelo" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Todos os modelos</SelectItem>

            {models.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={clearFilters} disabled={isPending}>
          Limpar filtros
        </Button>
      </div>

      <div
        className={
          isPending ? "pointer-events-none opacity-60 transition-opacity" : ""
        }
      >
        <div className="rounded-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Chassi</TableHead>
                <TableHead>Data Faturamento</TableHead>
                <TableHead>Previsão Chegada</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10} // Ajustado colSpan para bater com o número correto de colunas
                    className="py-8 text-center text-muted-foreground"
                  >
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => {
                  const motorcycle = item.motorcycles[0];

                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>

                      <TableCell>
                        <CopyText text={item.cpf}>
                          <span>{formatCPF(item.cpf)}</span>
                        </CopyText>
                      </TableCell>

                      <TableCell>{item.sellersName}</TableCell>

                      <TableCell>{item.city}</TableCell>

                      <TableCell>{motorcycle?.model ?? "—"}</TableCell>

                      <TableCell>
                        {motorcycle?.chassi ? (
                          <CopyText text={motorcycle.chassi}>
                            <span>{motorcycle.chassi}</span>
                          </CopyText>
                        ) : (
                          "—"
                        )}
                      </TableCell>

                      <TableCell>
                        {item.billingDate
                          ? format(item.billingDate, "dd/MM/yyyy")
                          : "—"}
                      </TableCell>

                      <TableCell>
                        {motorcycle?.forecastArrival
                          ? format(motorcycle.forecastArrival, "dd/MM/yyyy")
                          : "—"}
                      </TableCell>

                      <TableCell>
                        {motorcycle?.registrationStatus
                          ? mapRegistrationStatusLabel(
                              motorcycle.registrationStatus,
                            )
                          : "—"}
                      </TableCell>

                      <TableCell>
                        <div className="flex h-full items-center gap-1">
                          <Link
                            href={`/bdc/cliente/${item.id}/editar`}
                            aria-label={`editar-${item.id}`}
                            className={buttonVariants({
                              variant: "ghost",
                              size: "icon",
                              className: "rounded-full",
                            })}
                          >
                            <PencilIcon className="size-4" />
                          </Link>
                          <Link
                            href={`/bdc/cliente/${item.id}/deletar`}
                            aria-label={`deletar-${item.id}`}
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
    </div>
  );
}
