"use client";

import { useState } from "react";
import { useListNavigation } from "@/hooks/use-list-navigation";
import MotorcycleTable, { type MotorcycleTableProps } from "./MotorcycleTable";

export function InventoryPageClient(props: MotorcycleTableProps) {
  const { isPending, navigate, clear } = useListNavigation();
  const [chassisInput, setChassisInput] = useState(props.activeFilters.chassis);
  const [lastChassis, setLastChassis] = useState(props.activeFilters.chassis);
  if (lastChassis !== props.activeFilters.chassis) {
    setLastChassis(props.activeFilters.chassis);
    setChassisInput(props.activeFilters.chassis);
  }

  return (
    <MotorcycleTable
      {...props}
      isPending={isPending}
      chassisInput={chassisInput}
      onChassisInputChange={setChassisInput}
      onParamsChange={navigate}
      onPageChange={(page) => navigate({ page: String(page) }, false)}
      onClearFilters={() => {
        setChassisInput("");
        clear();
      }}
    />
  );
}
