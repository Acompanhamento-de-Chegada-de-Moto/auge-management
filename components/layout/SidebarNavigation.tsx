"use client";
import {
  ArrowUpRight,
  LayoutDashboard,
  LifeBuoy,
  Package,
  QrCode,
  Search,
  UserRoundCog,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  getActiveSidebarHref,
  getSidebarSections,
  type SidebarItem,
} from "@/lib/sidebar-navigation";

const icons: Record<SidebarItem["icon"], typeof Package> = {
  dashboard: LayoutDashboard,
  clients: UsersRound,
  inventory: Package,
  operators: UserRoundCog,
  support: LifeBuoy,
  "check-in": QrCode,
  tracking: Search,
};

export function SidebarNavigation({ role }: { role?: string | null }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const sections = getSidebarSections(role);
  const activeHref = getActiveSidebarHref(pathname, sections);
  return (
    <nav
      aria-label="Navegação principal"
      className="space-y-4 group-data-[collapsible=icon]:space-y-3"
    >
      {sections.map((section) => (
        <SidebarGroup key={section.title} className="p-0">
          <SidebarGroupLabel className="h-7 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
            {section.title}
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {section.items.map((item) => {
              const active = activeHref === item.href;
              const Icon = icons[item.icon];
              return (
                <SidebarMenuItem key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpenMobile(false)}
                    aria-current={active ? "page" : undefined}
                    aria-label={item.title}
                    title={
                      item.portal
                        ? `${item.title} · portal público`
                        : item.title
                    }
                    data-active={active}
                    className="group/nav-link relative flex h-10 items-center gap-3 overflow-hidden rounded-lg px-3 text-sm font-medium text-sidebar-foreground/75 outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-primary data-[active=true]:bg-primary/10 data-[active=true]:text-primary group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                  >
                    <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                    <span className="flex-1 truncate group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                    {item.portal && (
                      <ArrowUpRight
                        className="size-3.5 shrink-0 opacity-50 group-data-[collapsible=icon]:hidden"
                        aria-hidden="true"
                      />
                    )}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-primary group-data-[collapsible=icon]:hidden"
                      />
                    )}
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </nav>
  );
}
