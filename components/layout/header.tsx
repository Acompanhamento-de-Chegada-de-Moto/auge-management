"use client";

import { Bike } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { authClient } from "@/lib/auth-client";

export function Header() {
  const { data: session } = authClient.useSession();
  const userName = session?.user.name;
  const initial = userName?.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20"
          >
            <Bike className="size-5" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-base font-bold leading-tight text-foreground sm:text-lg">
              <span className="sm:hidden">Chegada de Motos</span>
              <span className="hidden sm:inline">
                Acompanhamento de Chegada de Moto
              </span>
            </h1>
            <p className="hidden truncate text-xs font-medium text-muted-foreground sm:block">
              Controle de chegada e status de motos da concessionária
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {userName && (
            <>
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground ring-1 ring-border sm:hidden"
                role="img"
                aria-label={`Sessão de ${userName}`}
              >
                {initial}
              </div>

              <div className="hidden items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-sm text-secondary-foreground sm:flex">
                <span
                  className="size-1.5 shrink-0 rounded-full bg-emerald-500"
                  aria-hidden="true"
                />
                <span className="max-w-[160px] truncate">{userName}</span>
              </div>
            </>
          )}

          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
