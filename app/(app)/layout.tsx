import { cookies } from "next/headers";
import { Suspense } from "react";
import { requireAuth } from "@/app/data/user/require-auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { RoutePending } from "@/components/layout/RoutePending";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SIDEBAR_COOKIE_NAME } from "@/lib/constants";
import { getSetting } from "@/lib/data/settings";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<RoutePending />}>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </Suspense>
  );
}

async function AuthenticatedShell({ children }: { children: React.ReactNode }) {
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
        <AppTopbar />

        <main id="main-content" className="min-w-0 flex-1 bg-base-200">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
