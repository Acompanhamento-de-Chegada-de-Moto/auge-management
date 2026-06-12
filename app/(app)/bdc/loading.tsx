import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function BDCLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-8 w-[160px] rounded-md" />
        <Skeleton className="h-8 w-[160px] rounded-md" />
        <Skeleton className="h-8 w-[160px] rounded-md" />
        <div className="ml-auto flex items-center gap-1">
          <Skeleton className="h-8 w-56 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      <div className="rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Cliente</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Chassi</TableHead>
              <TableHead>Data Faturamento</TableHead>
              <TableHead>Previsão Chegada</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="w-0 pr-4 text-end">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
              <TableRow key={`skeleton-${i}`}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24 rounded-full" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 justify-end">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
