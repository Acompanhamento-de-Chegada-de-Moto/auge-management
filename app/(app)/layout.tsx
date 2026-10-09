import { AppSidebar } from "@/components/layout/app-sidebar";
import { ModeToggle } from "@/components/ModeToggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getSetting } from "@/lib/data/settings";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const logoUrl = await getSetting("logo_url");

  return (
    <SidebarProvider>
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

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
