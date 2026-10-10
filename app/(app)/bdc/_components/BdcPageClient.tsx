"use client";

import { useListNavigation } from "@/hooks/use-list-navigation";
import type { BDCTableProps } from "../bdc-table.types";
import { BDCTable } from "./bdc-table";

export function BdcPageClient(props: BDCTableProps) {
  const { isPending, navigate, clear } = useListNavigation();
  return (
    <BDCTable
      {...props}
      isPending={isPending}
      onParamsChange={navigate}
      onPageChange={(page) => navigate({ page: String(page) }, false)}
      onClearFilters={clear}
    />
  );
}
