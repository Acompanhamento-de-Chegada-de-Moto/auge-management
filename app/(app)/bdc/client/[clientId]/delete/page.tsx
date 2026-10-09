import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientById } from "@/lib/data/client";
import { DeleteClientConfirmation } from "./_components/DeleteClientConfirmation";

export const metadata: Metadata = {
  title: "Excluir cliente",
};

export default async function DeleteClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getClientById(clientId);

  if (!client) notFound();

  return (
    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
      <DeleteClientConfirmation client={client} />
    </main>
  );
}
