import { Suspense } from "react";
import type { Metadata } from "next";

import { requireManager } from "@/app/data/admin/require-manager";
import {
  adminGetAllTickets,
  managerGetOwnTickets,
} from "@/app/data/admin/admin-get-tickets";
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
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
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
          <Badge variant="secondary" className="hidden sm:flex">
            {tickets.length} total
          </Badge>
        </CardHeader>
        <CardContent>
          <TicketList tickets={tickets} canManageStatus={isAdmin} />
        </CardContent>
      </Card>

      <Card className="h-fit lg:sticky lg:top-20">
        <CardHeader>
          <CardTitle className="text-base">Novo ticket</CardTitle>
          <CardDescription>
            Abra um chamado para o suporte técnico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TicketForm />
        </CardContent>
      </Card>
    </>
  );
}

export default async function SupportPage() {
  await requireManager();

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="border-b border-border/70 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Atendimento
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Suporte
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Abra um chamado e acompanhe as solicitações da equipe.
        </p>
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Suspense fallback={<SupportSkeleton />}>
          <RenderSupport />
        </Suspense>
      </div>
    </main>
  );
}
