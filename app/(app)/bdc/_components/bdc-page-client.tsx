'use client';

import { useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import BDCTable from '@/components/shadcn-studio/table/bdc-table';
import { mapRegistrationStatusLabel } from '@/lib/bdc-data';

interface MotorcycleRow {
  id: string;
  model: string;
  chassis: string;
  forecastDate: Date | null;
  registrationStatus: 'NO_PLATE' | 'PLATING' | 'PLATED';
}

interface ClientRow {
  id: string;
  cpf: string;
  name: string;
  sellerName: string;
  city: string;
  billingDate: Date | null;
  motorcycles: MotorcycleRow[];
}

interface PaginatedResult {
  clients: ClientRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface FilterOptions {
  sellers: string[];
  cities: string[];
  models: string[];
}

interface FlatRow {
  id: string;
  clientId: string;
  customerName: string;
  cpf: string;
  sellerName: string;
  city: string;
  model: string;
  chassis: string;
  billingDate: string;
  forecastDate: Date | null;
  registrationStatus: 'Sem Emplacamento' | 'Emplacando' | 'Emplacado';
}

interface BDCPageClientProps {
  data: PaginatedResult;
  filterOptions: FilterOptions;
}

function flatMapRows(clients: ClientRow[]): FlatRow[] {
  return clients.flatMap((client) =>
    client.motorcycles.length > 0
      ? client.motorcycles.map((motorcycle) => ({
          id: `${client.id}-${motorcycle.id}`,
          clientId: client.id,
          customerName: client.name,
          cpf: client.cpf,
          sellerName: client.sellerName,
          city: client.city,
          model: motorcycle.model,
          chassis: motorcycle.chassis,
          billingDate: client.billingDate
            ? new Date(client.billingDate).toLocaleDateString('pt-BR')
            : '—',
          forecastDate: motorcycle.forecastDate,
          registrationStatus: mapRegistrationStatusLabel(
            motorcycle.registrationStatus,
          ) as 'Sem Emplacamento' | 'Emplacando' | 'Emplacado',
        }))
      : [
          {
            id: client.id,
            clientId: client.id,
            customerName: client.name,
            cpf: client.cpf,
            sellerName: client.sellerName,
            city: client.city,
            model: '—',
            chassis: '—',
            billingDate: client.billingDate
              ? new Date(client.billingDate).toLocaleDateString('pt-BR')
              : '—',
            forecastDate: null,
            registrationStatus: 'Sem Emplacamento',
          },
        ],
  );
}

export function BDCPageClient({
  data,
  filterOptions,
}: BDCPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const page = Number(searchParams.get('page')) || 1;
  const sellerName = searchParams.get('sellerName') || '';
  const city = searchParams.get('city') || '';
  const model = searchParams.get('model') || '';
  const q = searchParams.get('q') || '';

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      if (key !== 'page') {
        params.delete('page');
      }

      startTransition(() => {
        router.push(`/bdc?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  const rows = flatMapRows(data.clients);

  return (
    <div className={isPending ? 'opacity-60 transition-opacity' : ''}>
      <BDCTable
        rows={rows}
        totalRows={data.total}
        page={data.page}
        totalPages={data.totalPages}
        filterOptions={filterOptions}
        filters={{
          sellerName,
          city,
          model,
        }}
        query={q}
        onFilterChange={(key, value) => setParam(key, value)}
        onPageChange={(page) => setParam('page', String(page))}
        onSearch={(query) => {
          const params = new URLSearchParams(searchParams.toString());

          if (query) {
            params.set('q', query);
          } else {
            params.delete('q');
          }

          params.delete('page');

          startTransition(() => {
            router.push(`/bdc?${params.toString()}`);
          });
        }}
        onClearSearch={() => {
          const params = new URLSearchParams(searchParams.toString());

          params.delete('q');
          params.delete('page');

          startTransition(() => {
            router.push(`/bdc?${params.toString()}`);
          });
        }}
      />
    </div>
  );
}