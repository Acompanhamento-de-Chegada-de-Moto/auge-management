"use client";

import { Palette, Settings2, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = [
  { title: "Usuários", href: "/settings", icon: Users },
  { title: "Aparência", href: "/settings/cosmetics", icon: Palette },
  { title: "Sistema", href: "/settings/system", icon: Settings2 },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const currentTab =
    pathname === "/settings"
      ? "/settings"
      : pathname === "/settings/cosmetics"
        ? "/settings/cosmetics"
        : "/settings/system";

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3 block md:hidden">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Settings2 className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight">Configurações</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie o sistema, usuários e personalização
          </p>
        </div>
      </div>

      <Tabs value={currentTab}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.href} value={tab.href} asChild>
              <Link href={tab.href}>
                <tab.icon className="mr-2 size-4" />
                {tab.title}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {children}
    </div>
  );
}
