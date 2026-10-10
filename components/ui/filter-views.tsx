import { cn } from "@/lib/utils";

export function FilterViews({
  label,
  views,
  value,
  isPending,
  onChange,
}: {
  label: string;
  views: readonly { label: string; value: string; count: number }[];
  value: string;
  isPending: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset
      className={cn(
        "grid gap-px overflow-hidden rounded-xl border border-base-300 bg-base-300",
        views.length === 4
          ? "grid-cols-2 sm:grid-cols-4"
          : "grid-cols-1 sm:grid-cols-3",
      )}
    >
      <legend className="sr-only">{label}</legend>
      {views.map((view) => (
        <button
          key={view.value}
          type="button"
          aria-pressed={value === view.value}
          disabled={isPending}
          onClick={() => onChange(view.value)}
          className={cn(
            "group relative flex min-h-24 flex-col items-start justify-center gap-2 border-0 bg-base-100 px-5 py-4 text-left outline-none transition-colors hover:bg-base-200 focus-visible:z-10 disabled:opacity-60",
            value === view.value &&
              "bg-base-200 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary",
          )}
        >
          <span
            className={cn(
              "text-xs",
              value === view.value ? "font-medium" : "text-base-content/65",
            )}
          >
            {view.label}
          </span>
          <span className="text-2xl font-semibold tracking-tight tabular-nums">
            {view.count.toLocaleString("pt-BR")}
          </span>
        </button>
      ))}
    </fieldset>
  );
}
