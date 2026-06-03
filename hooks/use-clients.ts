import { useQuery } from "@tanstack/react-query";
import { getClientsAction, searchClientsAction } from "@/app/(app)/bdc/actions";

export function useClients(query?: string) {
  return useQuery({
    queryKey: ["clients", query],
    queryFn: () => (query ? searchClientsAction(query) : getClientsAction()),
  });
}
