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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3 block md:hidden">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <LayoutDashboard className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Indicadores e métricas consolidadas do sistema
          </p>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <RenderDashboard />
      </Suspense>
    </div>
  );
}
