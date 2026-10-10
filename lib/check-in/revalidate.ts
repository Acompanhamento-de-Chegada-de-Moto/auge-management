import "server-only";
import { revalidatePath } from "next/cache";
import { revalidateListingCache } from "@/lib/api/revalidate-listing-cache";

export function revalidateArrivals(transport: "action" | "route") {
  revalidateListingCache(transport);
  for (const path of ["/inventory", "/bdc", "/dashboard"]) revalidatePath(path);
  revalidatePath("/tracking", "layout");
}
