"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  getBDCFilterOptionsAction,
  getClientsPaginatedAction,
} from "@/app/(app)/bdc/actions";
import BDCTable from "@/components/shadcn-studio/table/bdc-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getStatusColor,
  mapRegistrationStatusLabel,
} from "@/lib/bdc-data";

interface MotorcycleRow {
  id: string;
  model: string;
  chassis: string;
  forecastDate: Date | null;
  registrationStatus: "NO_PLATE" | "PLATING" | "PLATED";
}

interface ClientRow {
  id: string;
  cpf: string;
  name: string;
  sellerName: string;
  city: string;
  billingDate: Date | null;
  motorcycles: MotorcycleRow[];
}

interface PaginatedResult {
  clients: ClientRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface FilterOptions {
  sellers: string[];
  cities: string[];
  models: string[];
}

interface FlatRow {
  id: string;
  clientId: string;
  customerName: string;
  cpf: string;
  sellerName: string;
  city: string;
  model: string;
  chassis: string;
  billingDate: string;
  forecastDate: Date | null;
  registrationStatus: "Sem Emplacamento" | "Emplacando" | "Emplacado";
}

function flatMapRows(clients: ClientRow[]): FlatRow[] {
  return (clients ?? []).flatMap((client) =>
    client.motorcycles.length > 0
      ? client.motorcycles.map((motorcycle) => ({
          id: `${client.id}-${motorcycle.id}`,
          clientId: client.id,
          customerName: client.name,
          cpf: client.cpf,
          sellerName: client.sellerName,
          city: client.city,
          model: motorcycle.model,
          chassis: motorcycle.chassis,
          billingDate: client.billingDate
            ? new Date(client.billingDate).toLocaleDateString("pt-BR")
            : "—",
          forecastDate: motorcycle.forecastDate,
          registrationStatus: mapRegistrationStatusLabel(
            motorcycle.registrationStatus,
          ) as "Sem Emplacamento" | "Emplacando" | "Emplacado",
        }))
      : [
          {
            id: client.id,
            clientId: client.id,
            customerName: client.name,
            cpf: client.cpf,
            sellerName: client.sellerName,
            city: client.city,
            model: "—",
            chassis: "—",
            billingDate: client.billingDate
              ? new Date(client.billingDate).toLocaleDateString("pt-BR")
              : "—",
            forecastDate: null,
            registrationStatus: "Sem Emplacamento" as const,
          },
        ],
  );
}

function BDCTableSkeleton() {
  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-8 w-[160px] rounded-md" />
        <Skeleton className="h-8 w-[160px] rounded-md" />
        <Skeleton className="h-8 w-[160px] rounded-md" />
        <div className="ml-auto flex items-center gap-1">
          <Skeleton className="h-8 w-56 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
      <div className="rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Cliente</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Chassi</TableHead>
              <TableHead>Data Faturamento</TableHead>
              <TableHead>Previsão Chegada</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="w-0 pr-4 text-end">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
              <TableRow key={`skeleton-${i}`}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 justify-end">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function BDCPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const mountedRef = useRef(false);

  const page = Number(searchParams.get("page")) || 1;
  const sellerName = searchParams.get("sellerName") || "";
  const city = searchParams.get("city") || "";
  const model = searchParams.get("model") || "";
  const q = searchParams.get("q") || "";

  const [data, setData] = useState<PaginatedResult | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const [result, opts] = await Promise.all([
        getClientsPaginatedAction({
          page,
          pageSize: 20,
          sellerName: sellerName || undefined,
          city: city || undefined,
          model: model || undefined,
          search: q || undefined,
        }),
        getBDCFilterOptionsAction(),
      ]);
      setData(result);
      setFilterOptions(opts);
      setInitialLoading(false);
    }
    fetch();
  }, [page, sellerName, city, model, q]);

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (key !== "page") {
        params.delete("page");
      }
      startTransition(() => {
        router.push(`/bdc?${params.toString()}`);
      });
    },
    [searchParams, router, startTransition],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setParam("page", String(newPage));
    },
    [setParam],
  );

  const handleFilterChange = useCallback(
    (filterKey: string, value: string) => {
      setParam(filterKey, value);
    },
    [setParam],
  );

  const handleSearch = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      params.delete("page");
      startTransition(() => {
        router.push(`/bdc?${params.toString()}`);
      });
    },
    [searchParams, router, startTransition],
  );

  const handleClearSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    startTransition(() => {
      router.push(`/bdc?${params.toString()}`);
    });
  }, [searchParams, router, startTransition]);

  if (initialLoading) {
    return <BDCTableSkeleton />;
  }

  const rows = flatMapRows(data?.clients ?? []);

  return (
    <div className={isPending ? "opacity-60 transition-opacity" : ""}>
      <BDCTable
        rows={rows}
        totalRows={data?.total ?? 0}
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        filterOptions={
          filterOptions ?? { sellers: [], cities: [], models: [] }
        }
        filters={{ sellerName, city, model }}
        query={q}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
      />
    </div>
  );
}
