import { useQuery } from "@tanstack/react-query";
import { getClientByIdAction } from "@/app/(app)/bdc/cliente/editar/actions";

export function useClientById(clientId: string) {
  return useQuery({
    queryKey: ["client", clientId],
    queryFn: () => getClientByIdAction(clientId),
    enabled: !!clientId,
  });
}
