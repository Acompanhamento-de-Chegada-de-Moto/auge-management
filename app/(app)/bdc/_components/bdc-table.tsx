import { format } from "date-fns";
import type { UserGetClientsType } from "@/app/data/user/user-get-clients";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface IBDCTableProps {
  data: UserGetClientsType[];
}

export function BDCTable({ data }: IBDCTableProps) {
  return (
    <div className="w-full">
      {/* Filtros */}
      {/* <div className="flex flex-wrap items-center gap-2 mb-4">
        <Select
          value={filters.sellerName}
          onValueChange={(v) =>
            onFilterChange("sellerName", v === " " ? "" : v)
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Vendedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Todos</SelectItem>
            {filterOptions.sellers.map((seller) => (
              <SelectItem key={seller} value={seller}>
                {seller}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.city}
          onValueChange={(v) => onFilterChange("city", v === " " ? "" : v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Todos</SelectItem>
            {filterOptions.cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.model}
          onValueChange={(v) => onFilterChange("model", v === " " ? "" : v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Modelo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Todos</SelectItem>
            {filterOptions.models.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div> */}

      {/* Tabela */}
      <div className="rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Chassi</TableHead>
              <TableHead>Data Faturamento</TableHead>
              <TableHead>Previsão Chegada</TableHead>
              <TableHead>Situação</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground py-8"
                >
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.cpf}</TableCell>
                  <TableCell>{item.sellerName}</TableCell>
                  <TableCell>{item.city}</TableCell>
                  <TableCell>{item.motorcycles[0].model}</TableCell>
                  <TableCell>{item.motorcycles[0].chassis}</TableCell>
                  <TableCell>
                    {format(new Date(item.billingDate as Date), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(
                      new Date(item.motorcycles[0].forecastDate as Date),
                      "dd/MM/yyyy",
                    )}
                  </TableCell>
                  <TableCell>
                    {item.motorcycles[0].registrationStatus}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
