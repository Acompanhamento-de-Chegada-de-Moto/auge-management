import { Suspense } from "react";
import { RoutePending } from "@/components/layout/RoutePending";
import { getCheckInAccess } from "@/lib/check-in/access";
import { CheckInConsole } from "./_components/CheckInConsole";

export const metadata = { title: "Recebimento de motocicletas" };
export default function CheckInPage() {
  return (
    <main className="min-h-screen bg-base-200 px-4 py-8">
      <div className="mx-auto max-w-xl">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Auge · Recebimento
          </p>
          <h1 className="mt-2 text-2xl font-semibold">
            Check-in de motocicletas
          </h1>
          <p className="mt-2 text-sm text-base-content/65">
            Confira a motocicleta física e confirme sua chegada.
          </p>
        </header>
        <Suspense fallback={<RoutePending compact />}>
          <CheckInContent />
        </Suspense>
      </div>
    </main>
  );
}
async function CheckInContent() {
  const session = await getCheckInAccess();
  return (
    <CheckInConsole
      operator={
        session
          ? {
              name: session.name,
              kind: session.kind,
              expiresAt: session.expiresAt.toISOString(),
            }
          : null
      }
    />
  );
}
