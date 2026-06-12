"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  getEstoqueFilterOptionsAction,
  getMotorcyclesPaginatedAction,
} from "@/app/(app)/estoque/actions";
import MotorcycleTable from "@/components/estoque/motorcycle-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MotorcycleRow {
  id: string;
  chassis: string;
  model: string;
  forecastDate: Date | null;
}

interface PaginatedResult {
  motorcycles: MotorcycleRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface FilterOptions {
  models: string[];
}

function MotorcycleTableSkeleton() {
  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-8 w-[160px] rounded-md" />
        <Skeleton className="h-8 w-[160px] rounded-md" />
        <div className="ml-auto">
          <Skeleton className="h-8 w-[200px] rounded-md" />
        </div>
      </div>
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
            {Array.from({ length: 10 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
              <TableRow key={`skeleton-${i}`}>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
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

export function EstoquePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const page = Number(searchParams.get("page")) || 1;
  const model = searchParams.get("model") || "";
  const status = searchParams.get("status") || "";
  const chassisSearch = searchParams.get("chassis") || "";

  const [data, setData] = useState<PaginatedResult | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const [result, opts] = await Promise.all([
        getMotorcyclesPaginatedAction({
          page,
          pageSize: 50,
          model: model || undefined,
          status: status as "Em Trânsito" | "Chegou" | "Atrasada" | undefined,
          chassisSearch: chassisSearch || undefined,
        }),
        getEstoqueFilterOptionsAction(),
      ]);
      setData(result);
      setFilterOptions(opts);
      setInitialLoading(false);
    }
    fetch();
  }, [page, model, status, chassisSearch]);

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
        router.push(`/estoque?${params.toString()}`);
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

  const handleChassisSearch = useCallback(
    (value: string) => {
      setParam("chassis", value);
    },
    [setParam],
  );

  if (initialLoading) {
    return <MotorcycleTableSkeleton />;
  }

  return (
    <div className={isPending ? "opacity-60 transition-opacity" : ""}>
      <MotorcycleTable
        motorcycles={data?.motorcycles ?? []}
        totalRows={data?.total ?? 0}
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        filterOptions={filterOptions ?? { models: [] }}
        filters={{ model, status }}
        chassisSearch={chassisSearch}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onChassisSearchChange={handleChassisSearch}
      />
    </div>
  );
}
