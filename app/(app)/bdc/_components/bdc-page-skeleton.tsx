import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function BDCPageSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-10 w-full sm:w-45" />
        <Skeleton className="h-10 w-full sm:w-45" />
        <Skeleton className="h-10 w-full sm:w-45" />
        <Skeleton className="h-10 w-30" />
      </div>

      <div className="space-y-3 md:hidden">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex shrink-0 gap-1">
                <Skeleton className="size-11 rounded-full" />
                <Skeleton className="size-11 rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg border md:block">
        <Table className="w-full table-fixed text-xs">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20%] whitespace-normal px-2">
                Cliente
              </TableHead>
              <TableHead className="hidden w-[12%] whitespace-normal px-2 xl:table-cell">
                CPF
              </TableHead>
              <TableHead className="hidden w-[12%] whitespace-normal px-2 xl:table-cell">
                Vendedor
              </TableHead>
              <TableHead className="hidden w-[12%] whitespace-normal px-2 2xl:table-cell">
                Cidade
              </TableHead>
              <TableHead className="w-[14%] whitespace-normal px-2">
                Modelo
              </TableHead>
              <TableHead className="w-[14%] whitespace-normal px-2">
                Chassi
              </TableHead>
              <TableHead className="hidden w-[12%] whitespace-normal px-2 2xl:table-cell">
                Faturamento
              </TableHead>
              <TableHead className="w-[14%] whitespace-normal px-2">
                Previsão
              </TableHead>
              <TableHead className="w-[12%] whitespace-normal px-2">
                Situação
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {Array.from({ length: 10 }, (_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-44" />
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <Skeleton className="h-4 w-36" />
                </TableCell>
                <TableCell className="hidden 2xl:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell className="hidden 2xl:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
