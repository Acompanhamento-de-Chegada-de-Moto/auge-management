import "server-only";
import { revalidateMotorcyclePages } from "@/lib/services/revalidate-motorcycle-pages";

export function revalidateArrivals(transport: "action" | "route") {
  revalidateMotorcyclePages(transport);
}
