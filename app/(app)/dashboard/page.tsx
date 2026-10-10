import { LayoutDashboard } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { Page, PageHeader } from "@/components/layout/Page";
import { getDashboardSummary } from "@/lib/data/dashboard";

import { DashboardClient } from "./_components/dashboard-client";
import { DashboardSkeleton } from "./_components/dashboard-skeleton";

export const metadata: Metadata = {
  title: "Dashboard",
};

async function RenderDashboard() {
  await requireAdmin();
  const data = await getDashboardSummary();

  return <DashboardClient data={data} />;
}

export default function DashboardPage() {
  return (
    <Page>
      <PageHeader
        title="Dashboard"
        eyebrow="Visão geral"
        description="Indicadores e métricas consolidadas do sistema"
        icon={<LayoutDashboard className="size-5" />}
      />

      <Suspense fallback={<DashboardSkeleton />}>
        <RenderDashboard />
      </Suspense>
    </Page>
  );
}
