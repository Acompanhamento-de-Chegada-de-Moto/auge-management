import { revalidateTag } from "next/cache";
import { listingCacheTags } from "@/lib/data/listing-cache-tags";

export function revalidateListingCache() {
  for (const tag of Object.values(listingCacheTags)) {
    revalidateTag(tag, { expire: 0 });
  }
}
