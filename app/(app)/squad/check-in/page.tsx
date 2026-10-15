import { Suspense } from "react";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { Page, PageHeader } from "@/components/layout/Page";
import { RoutePending } from "@/components/layout/RoutePending";
import { listCheckInOperators } from "@/lib/data/check-in";
import { OperatorsPanel } from "./_components/OperatorsPanel";

export const metadata = { title: "Operadores de recebimento" };
export default function OperatorsPage() {
  return (
    <Suspense fallback={<RoutePending />}>
      <OperatorsContent />
    </Suspense>
  );
}
async function OperatorsContent() {
  await requireAdmin();
  const operators = await listCheckInOperators();
  return (
    <Page>
      <PageHeader
        title="Operadores de recebimento"
        eyebrow="Administração"
        description="Gere PINs individuais e controle o acesso ao check-in público."
      />
      <OperatorsPanel
        operators={operators.map(({ createdAt, ...operator }) => operator)}
      />
    </Page>
  );
}
