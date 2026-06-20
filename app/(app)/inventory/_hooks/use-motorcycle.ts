"use client";

import { useQuery } from "@tanstack/react-query";
import { getMotorcycleByIdAction } from "@/app/(app)/inventory/actions";

export function useMotorcycle(id: string) {
  return useQuery({
    queryKey: ["motorcycle", id],
    queryFn: () => getMotorcycleByIdAction(id),
    enabled: !!id,
  });
}
