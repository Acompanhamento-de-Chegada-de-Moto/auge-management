"use client";

import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/ModeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

const routeLabels: Array<[RegExp, string, string]> = [
  [/^\/bdc\/client\/new$/, "BDC", "Novo cliente"],
  [/^\/bdc\/client\/[^/]+\/edit$/, "BDC", "Editar cliente"],
  [/^\/bdc\/client\/[^/]+\/delete$/, "BDC", "Excluir cliente"],
  [/^\/bdc$/, "Relacionamento", "BDC"],
  [/^\/inventory\/motorcycle\/new$/, "Estoque", "Nova motocicleta"],
  [/^\/inventory\/motorcycle\/[^/]+\/edit$/, "Estoque", "Editar motocicleta"],
  [
    /^\/inventory\/motorcycle\/[^/]+\/delete$/,
    "Estoque",
    "Excluir motocicleta",
  ],
  [/^\/inventory$/, "Operação", "Estoque"],
  [/^\/dashboard$/, "Análises", "Dashboard"],
  [/^\/squad$/, "Administração", "Equipe"],
  [/^\/support$/, "Atendimento", "Suporte"],
];

export function AppTopbar() {
  const pathname = usePathname();
  const [, section, page] = routeLabels.find(([pattern]) =>
    pattern.test(pathname),
  ) ?? [/^\//, "Auge Management", "Área de trabalho"];

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-base-300/80 bg-base-100 px-4 sm:px-6">
      <SidebarTrigger className="size-10 rounded-xl" />
      <div className="h-7 w-px bg-border/70" aria-hidden="true" />

      <nav aria-label="Localização atual" className="min-w-0 flex-1">
        <ol className="flex min-w-0 items-center gap-2 text-sm">
          <li className="hidden truncate text-muted-foreground sm:block">
            {section}
          </li>
          <li
            className="hidden text-muted-foreground/50 sm:block"
            aria-hidden="true"
          >
            /
          </li>
          <li
            aria-current="page"
            className="truncate font-medium tracking-tight"
          >
            {page}
          </li>
        </ol>
      </nav>

      <ModeToggle />
    </header>
  );
}
