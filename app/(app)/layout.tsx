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
import { requireAuth } from "@/app/data/user/require-auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  const [logoUrl, cookieStore] = await Promise.all([
    getSetting("logo_url"),
    cookies(),
  ]);

  const defaultOpen = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== "false";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-background px-4 py-2 text-sm font-medium shadow focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Ir para o conteúdo principal
      </a>
      <AppSidebar logoUrl={logoUrl} user={session.user} />

      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarTrigger />

          <div className="h-5 w-px bg-border" />

          <div className="flex min-w-0 flex-1 items-center">
            <span className="truncate text-sm font-medium">Acompanhamento</span>
          </div>

          <ModeToggle />
        </header>

        <main id="main-content" className="min-w-0 flex-1 bg-muted/20">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
