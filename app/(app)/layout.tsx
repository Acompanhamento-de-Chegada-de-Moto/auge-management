import { cookies } from "next/headers";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ModeToggle } from "@/components/ModeToggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SIDEBAR_COOKIE_NAME } from "@/lib/constants";
import { getSetting } from "@/lib/data/settings";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [logoUrl, cookieStore] = await Promise.all([
    getSetting("logo_url"),
    cookies(),
  ]);

  const defaultOpen = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== "false";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar logoUrl={logoUrl} />

      <SidebarInset className="min-w-0">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
          <SidebarTrigger />

          <div className="h-5 w-px bg-border" />

          <div className="flex min-w-0 flex-1 items-center">
            <span className="truncate text-sm font-medium">Acompanhamento</span>
          </div>

          <ModeToggle />
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
