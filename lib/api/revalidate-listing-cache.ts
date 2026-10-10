import { revalidateTag, updateTag } from "next/cache";
import { listingCacheTags } from "@/lib/data/listing-cache-tags";

export function revalidateListingCache(
  transport: "action" | "route" = "route",
) {
  for (const tag of Object.values(listingCacheTags)) {
    if (transport === "action") updateTag(tag);
    else revalidateTag(tag, { expire: 0 });
  }
}
