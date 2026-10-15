import type { searchClients } from "@/lib/data/client";
import { ClientDetails } from "./ClientDetails";
import { MotorcycleCard } from "./MotorcycleCard";

type Client = Awaited<ReturnType<typeof searchClients>>[number];
export function ClientCard({ client }: { client: Client }) {
  return (
    <div className="space-y-5">
      <ClientDetails client={client} />
      {client.motorcycles.length ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {client.motorcycles.map((motorcycle) => (
            <MotorcycleCard key={motorcycle.id} motorcycle={motorcycle} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-base-300 bg-base-100 p-6 text-sm text-base-content/65">
          Nenhuma motocicleta vinculada a este atendimento no momento.
        </p>
      )}
    </div>
  );
}
