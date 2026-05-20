"use client";

import { Bike } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";

export function Header() {
  const { data: session } = authClient.useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="flex justify-between items-center w-full mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20">
            <Bike className="size-5" />
          </div>

          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight text-balance">
              Acompanhamento de Chegada de Moto
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              Controle de chegada e status de motos da concessionária
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {session?.user.name && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1.5 border border-border px-3 py-1 bg-secondary text-secondary-foreground"
            >
              <div className="size-1.5 rounded-full bg-emerald-500" />
              {session?.user.name}
            </Badge>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
