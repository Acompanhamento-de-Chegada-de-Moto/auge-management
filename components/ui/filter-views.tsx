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
        "grid gap-2",
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
            "btn h-auto min-h-16 justify-between border-base-300/80 bg-base-100 px-4 text-left font-normal hover:bg-base-200",
            value === view.value &&
              "border-primary bg-primary/5 ring-1 ring-primary/20",
          )}
        >
          <span
            className={cn(
              "text-sm",
              value === view.value ? "font-medium" : "text-base-content/65",
            )}
          >
            {view.label}
          </span>
          <span className="text-lg font-semibold tabular-nums">
            {view.count}
          </span>
        </button>
      ))}
    </fieldset>
  );
}
