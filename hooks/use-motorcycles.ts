import { useQuery } from "@tanstack/react-query";
import { getMotorcyclesAction } from "@/app/(app)/logistica/actions";

export function useMotorcycles() {
  return useQuery({
    queryKey: ["motorcycles"],
    queryFn: getMotorcyclesAction,
  });
}
