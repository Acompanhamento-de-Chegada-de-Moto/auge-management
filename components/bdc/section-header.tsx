import type { ReactElement } from "react";

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  description?: string;
}

export function SectionHeader({
  icon: Icon,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
        <Icon className="size-4" />
      </div>
      <div>
        <h3 className="text-sm font-semibold leading-none">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
