import type { Metadata } from "next";
import { Suspense } from "react";
import {
  adminGetAllTickets,
  managerGetOwnTickets,
} from "@/app/data/admin/admin-get-tickets";
import { requireManager } from "@/app/data/admin/require-manager";
import { Page, PageHeader } from "@/components/layout/Page";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TicketForm } from "./_components/ticket-form";
import { TicketList } from "./_components/ticket-list";
import { SupportSkeleton } from "./_components/ticket-skeleton";

export const metadata: Metadata = {
  title: "Suporte",
};

async function RenderSupport() {
  const session = await requireManager();
  const isAdmin = session.user.role === "ADMIN";
  const tickets = isAdmin
    ? await adminGetAllTickets()
    : await managerGetOwnTickets(session.user.id);

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">
            {isAdmin ? "Todos os tickets" : "Meus tickets"}
          </CardTitle>
          <CardDescription>
            {tickets.length === 0
              ? "Nenhum ticket ainda"
              : `${tickets.length} ticket(s)`}
          </CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="hidden sm:flex">
            {tickets.length} total
          </Badge>
          <TicketForm />
        </div>
      </CardHeader>
      <CardContent>
        <TicketList tickets={tickets} canManageStatus={isAdmin} />
      </CardContent>
    </Card>
  );
}

export default function SupportPage() {
  return (
    <Page>
      <PageHeader
        title="Suporte"
        eyebrow="Atendimento"
        description="Abra um chamado e acompanhe as solicitações da equipe."
      />
      <Suspense fallback={<SupportSkeleton />}>
        <RenderSupport />
      </Suspense>
    </Page>
  );
}
