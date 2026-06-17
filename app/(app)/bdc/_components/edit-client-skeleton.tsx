import { Skeleton } from "@/components/ui/skeleton";

export function EditClientSkeleton() {
  return (
    <>
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="flex-1">
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-6 w-11 rounded-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="flex gap-2">
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </div>

        <aside className="shrink-0 w-full lg:w-80">
          <div className="sticky top-4 rounded-lg border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>

            <div className="space-y-4">
              <Skeleton className="h-6 w-24 rounded-full" />

              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-32" />
              </div>

              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-28" />
              </div>

              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>

              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-32" />
              </div>

              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-28" />
              </div>

              <div className="space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>

              <div className="space-y-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-6 w-28 rounded-md" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
