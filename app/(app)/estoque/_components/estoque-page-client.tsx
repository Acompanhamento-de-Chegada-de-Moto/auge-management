"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import MotorcycleTable from "@/components/estoque/motorcycle-table";

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

interface EstoquePageClientProps {
  data: PaginatedResult;
  filterOptions: FilterOptions;
}

export function EstoquePageClient({
  data,
  filterOptions,
}: EstoquePageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const model = searchParams.get("model") || "";
  const status = searchParams.get("status") || "";
  const chassisSearch = searchParams.get("chassis") || "";

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

  return (
    <div className={isPending ? "opacity-60 transition-opacity" : ""}>
      <MotorcycleTable
        motorcycles={data.motorcycles}
        totalRows={data.total}
        page={data.page}
        totalPages={data.totalPages}
        filterOptions={filterOptions}
        filters={{ model, status }}
        chassisSearch={chassisSearch}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onChassisSearchChange={handleChassisSearch}
      />
    </div>
  );
}
