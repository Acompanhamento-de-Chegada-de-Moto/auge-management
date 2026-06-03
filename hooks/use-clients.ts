import { useQuery } from "@tanstack/react-query";
import { getClientsAction, searchClientsAction } from "@/app/(app)/bdc/actions";

export function useClients(query?: string, initialData?: unknown) {
  return useQuery({
    queryKey: ["clients", query],
    queryFn: () => (query ? searchClientsAction(query) : getClientsAction()),
    initialData: initialData as never,
  });
}
