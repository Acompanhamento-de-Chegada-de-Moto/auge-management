// SidebarNav.tsx
"use client";

import { Settings2, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/settings",
    label: "Usuários",
    description: "Acessos e permissões",
    icon: Users,
  },
  {
    href: "/settings/system",
    label: "Sistema",
    description: "Contato e mensagens",
    icon: Settings2,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação de configurações"
      className="flex w-full shrink-0 flex-row gap-2 overflow-x-auto md:w-56 md:flex-col md:gap-1"
    >
      {links.map(({ href, label, description, icon: Icon }) => {
        const active =
          href === "/settings" ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              "min-h-[44px]",
              active
                ? "bg-primary/[0.07] text-primary"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            {active && (
              <span
                aria-hidden="true"
                className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary md:block hidden"
              />
            )}
            <Icon className="size-4 shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="font-medium">{label}</span>
              <span className="hidden text-xs text-muted-foreground/80 md:block">
                {description}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
