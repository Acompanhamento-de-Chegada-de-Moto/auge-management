import { SearchX } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div
      aria-live="polite"
      className="flex flex-col items-center px-6 py-16 text-center"
    >
      <span className="mb-4 flex size-12 items-center justify-center rounded-xl border border-base-300 bg-base-200">
        <SearchX className="size-5 text-muted-foreground" aria-hidden="true" />
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
