import { Suspense } from "react";
import type { Metadata } from "next";

import { requireManager } from "@/app/data/admin/require-manager";
import { adminGetAllTickets, managerGetOwnTickets } from "@/app/data/admin/admin-get-tickets";
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
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 block md:hidden">
        <h1 className="text-lg font-bold">Suporte</h1>
        <p className="text-sm text-muted-foreground">
          Abra um chamado para o suporte técnico
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Suspense fallback={<SupportSkeleton />}>
          <RenderSupport />
        </Suspense>
      </div>
    </div>
  );
}
