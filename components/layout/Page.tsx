import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Page({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "mx-auto w-full min-w-0 max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  icon,
}: {
  title: string;
  description: string;
  eyebrow?: string;
  actions?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <header className="flex min-w-0 flex-col gap-5 border-b border-base-300/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {icon && (
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
        <div className="min-w-0 space-y-1">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="text-sm text-base-content/65">{description}</p>
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}
