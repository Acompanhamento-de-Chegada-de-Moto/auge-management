"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/configuracoes", label: "Usuários", icon: Users },
  { href: "/configuracoes/sistema", label: "Sistema", icon: Settings2 },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 w-44 shrink-0">
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/configuracoes"
            ? pathname === href
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
