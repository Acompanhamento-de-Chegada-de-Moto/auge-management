import { formatDocument, isLegacyDocument } from "@/lib/document";
import { formatDateBR } from "@/lib/utils";

export function ClientDetails({
  client,
}: {
  client: {
    name: string;
    document: string;
    sellersName: string;
    city: string;
    billingDate: Date | null;
  };
}) {
  return (
    <section
      className="rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-7"
      aria-label="Dados do cliente"
    >
      <h2 className="text-base font-semibold">Dados do cliente</h2>
      <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-base-content/60">Cliente</dt>
          <dd className="mt-1.5 font-medium">{client.name}</dd>
        </div>
        {!isLegacyDocument(client.document) && (
          <div>
            <dt className="text-xs text-base-content/60">CPF ou CNPJ</dt>
            <dd className="mt-1.5 font-mono">
              {formatDocument(client.document)}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-xs text-base-content/60">Vendedor</dt>
          <dd className="mt-1.5">{client.sellersName || "Não informado"}</dd>
        </div>
        <div>
          <dt className="text-xs text-base-content/60">Cidade</dt>
          <dd className="mt-1.5">{client.city || "Não informada"}</dd>
        </div>
        <div>
          <dt className="text-xs text-base-content/60">Data de faturamento</dt>
          <dd className="mt-1.5">
            {formatDateBR(client.billingDate) ?? "Não informada"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
