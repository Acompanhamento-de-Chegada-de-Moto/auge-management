import { CheckCircle2, Info } from "lucide-react";
import type { ReactNode } from "react";

export function FormWorkspace({
  children,
  title,
  steps,
}: {
  children: ReactNode;
  title: string;
  steps: readonly string[];
}) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div className="form-workspace min-w-0 rounded-xl border border-base-300 bg-base-100 p-4 sm:p-6">
        {children}
      </div>
      <aside
        aria-label="Orientações do cadastro"
        className="rounded-xl border border-base-300 bg-base-100 p-5 lg:sticky lg:top-20"
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Info className="size-4 text-muted-foreground" aria-hidden="true" />
          {title}
        </div>
        <ul className="mt-4 space-y-4">
          {steps.map((step) => (
            <li
              key={step}
              className="flex gap-2.5 text-xs leading-5 text-muted-foreground"
            >
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>{step}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 border-t border-base-300 pt-4 text-xs leading-5 text-muted-foreground">
          Revise os dados antes de salvar. Campos com * são obrigatórios.
        </p>
      </aside>
    </div>
  );
}
