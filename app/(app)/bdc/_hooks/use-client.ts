"use client";

import { useQuery } from "@tanstack/react-query";
import { getClientByIdAction } from "@/app/(app)/bdc/actions";

export function useClient(id: string) {
  return useQuery({
    queryKey: ["client", id],
    queryFn: () => getClientByIdAction(id),
    enabled: !!id,
  });
}
