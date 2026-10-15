import "server-only";
import { revalidatePath } from "next/cache";
import { revalidateListingCache } from "@/lib/api/revalidate-listing-cache";

export function revalidateMotorcyclePages(transport: "action" | "route") {
  revalidateListingCache(transport);
  for (const path of ["/bdc", "/inventory", "/dashboard"]) revalidatePath(path);
  revalidatePath("/tracking", "layout");
}
