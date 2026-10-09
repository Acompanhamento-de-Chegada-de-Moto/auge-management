import { LayoutDashboard } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { getDashboardSummary } from "@/lib/data/dashboard";

import { DashboardClient } from "./_components/dashboard-client";
import { DashboardSkeleton } from "./_components/dashboard-skeleton";

export const metadata: Metadata = {
  title: "Dashboard",
};

async function RenderDashboard() {
  const data = await getDashboardSummary();

  return <DashboardClient data={data} />;
}

export default async function DashboardPage() {
  await requireAdmin();

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex items-center gap-3 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <LayoutDashboard className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Visão geral
          </p>
          <h1 className="text-2xl font-semibold leading-tight tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Indicadores e métricas consolidadas do sistema
          </p>
        </div>
      </header>

      <Suspense fallback={<DashboardSkeleton />}>
        <RenderDashboard />
      </Suspense>
    </main>
  );
}
