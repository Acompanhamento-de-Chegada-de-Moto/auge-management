import { Skeleton } from "./skeleton";

export function ListWorkspaceSkeleton({ views = 3 }: { views?: 3 | 4 }) {
  return (
    <section
      aria-label="Carregando listagem"
      aria-busy="true"
      className="space-y-4"
    >
      <div
        className={`grid gap-2 ${views === 4 ? "grid-cols-2 sm:grid-cols-4" : "sm:grid-cols-3"}`}
        aria-hidden="true"
      >
        {Array.from({ length: views }, (_, i) => (
          <Skeleton key={`view-${i}`} className="h-24 rounded-xl" />
        ))}
      </div>
      <div
        className="overflow-hidden rounded-xl border border-base-300 bg-base-100"
        aria-hidden="true"
      >
        <div className="space-y-2 border-b border-base-300 p-5">
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-3 w-72 max-w-full" />
        </div>
        <div className="space-y-3 border-b border-base-300 p-5">
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-44" />
            <Skeleton className="h-10 w-44" />
          </div>
        </div>
        <div className="space-y-4 p-5">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={`row-${i}`}
              className="grid grid-cols-2 gap-4 border-b border-base-300 pb-4 sm:grid-cols-4 lg:grid-cols-6"
            >
              {Array.from({ length: 6 }, (_, j) => (
                <Skeleton key={`cell-${j}`} className="h-6" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
