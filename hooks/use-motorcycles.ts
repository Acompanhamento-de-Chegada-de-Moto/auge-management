import { useQuery } from "@tanstack/react-query";
import { getMotorcyclesAction } from "@/app/(app)/logistica/actions";

export function useMotorcycles(initialData?: unknown) {
  return useQuery({
    queryKey: ["motorcycles"],
    queryFn: getMotorcyclesAction,
    initialData: initialData as never,
  });
}
