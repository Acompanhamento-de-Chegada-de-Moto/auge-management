import type { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function SectionHeader({
  icon: Icon,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="mb-5 flex items-start gap-2.5">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-primary"
        aria-hidden="true"
      />

      <div className="min-w-0 space-y-1">
        <h2 className="text-sm font-semibold tracking-tight sm:text-base">
          {title}
        </h2>

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
