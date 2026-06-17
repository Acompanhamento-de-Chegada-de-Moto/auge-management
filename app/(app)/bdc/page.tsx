import { PlusIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import {
  userGetClientsPaginated,
  userGetFilterOptions,
} from '@/app/data/user/user-get-clients';

import { SpreadsheetUploadDialog } from '@/components/bdc/spreadsheet-upload-dialog';
import { Button } from '@/components/ui/button';

import { BDCPageClient } from './_components/bdc-page-client';

export const metadata: Metadata = {
  title: 'BDC',
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    sellerName?: string;
    city?: string;
    model?: string;
    q?: string;
  }>;
}

export default async function BDCPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const sellerName = params.sellerName;
  const city = params.city;
  const model = params.model;
  const q = params.q;

  const [data, filterOptions] = await Promise.all([
    userGetClientsPaginated({
      page,
      pageSize: 20,
      sellerName,
      city,
      model,
      search: q,
    }),
    userGetFilterOptions(),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-muted-foreground">
          Acompanhamento de Clientes.
        </p>

        <div className="flex items-center gap-2">
          <SpreadsheetUploadDialog />

          <Button asChild>
            <Link href="/bdc/cliente/novo">
              <PlusIcon className="mr-2 size-4" />
              Adicionar Cliente
            </Link>
          </Button>
        </div>
      </div>

      <BDCPageClient
        data={data}
        filterOptions={filterOptions}
      />
    </div>
  );
}