"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarAccount, type SidebarUser } from "./SidebarAccount";
import { SidebarNavigation } from "./SidebarNavigation";

export function AppSidebar({
  logoUrl,
  user,
}: {
  logoUrl?: string | null;
  user: SidebarUser;
}) {
  const { setOpenMobile } = useSidebar();
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border/60 px-3 py-4">
        <Link
          href="/bdc"
          aria-label="Auge Management — clientes"
          onClick={() => setOpenMobile(false)}
          title="Auge Management"
          className="group flex h-12 items-center gap-3 rounded-xl px-2 transition-colors hover:bg-sidebar-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Image
            src={logoUrl || "/logo-auge.png"}
            alt=""
            width={36}
            height={36}
            className="size-9 shrink-0 rounded-xl object-contain"
            unoptimized={Boolean(logoUrl)}
          />
          <span className="grid min-w-0 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold tracking-tight">
              Auge
            </span>
            <span className="truncate pt-1 text-xs text-muted-foreground">
              Console de operações
            </span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2 py-3">
        <SidebarNavigation role={user.role} />
      </SidebarContent>
      <SidebarAccount user={user} />
    </Sidebar>
  );
}
