import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMotorcycleById } from "@/lib/data/motorcycle";
import { DeleteMotorcycleConfirmation } from "./_components/DeleteMotorcycleConfirmation";

export const metadata: Metadata = {
  title: "Excluir motocicleta",
};

export default async function DeleteMotorcyclePage({
  params,
}: {
  params: Promise<{ motorcycleId: string }>;
}) {
  const { motorcycleId } = await params;
  const motorcycle = await getMotorcycleById(motorcycleId);

  if (!motorcycle) notFound();

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] min-w-0 w-full max-w-[1600px] items-start justify-center bg-muted/20 p-4 sm:items-center sm:p-6 lg:p-8">
      <DeleteMotorcycleConfirmation motorcycle={motorcycle} />
    </main>
  );
}
