import { Skeleton } from "@/components/ui/skeleton";

export function RoutePending({ compact = false }: { compact?: boolean }) {
  return (
    <section
      aria-label="Carregando conteúdo"
      aria-busy="true"
      className="mx-auto w-full max-w-5xl space-y-6 p-6"
    >
      <div aria-hidden="true" className="space-y-3">
        <Skeleton className="h-7 w-48 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
        <div className="space-y-4 rounded-xl border border-base-300 bg-base-100 p-5">
          {Array.from({ length: compact ? 3 : 5 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>
      </div>
    </section>
  );
}
