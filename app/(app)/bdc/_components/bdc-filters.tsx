"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BDCFiltersProps {
  filterOptions: {
    sellers: string[];
    cities: string[];
    models: string[];
  };
  activeFilters: {
    sellerName: string;
    city: string;
    model: string;
    search: string;
    arrived: string;
  };
  isPending: boolean;
  onFilterChange: (key: "sellerName" | "city" | "model", value: string) => void;
  onSearch: (value: string) => void;
  onClear: () => void;
}

export function BDCFilters({
  filterOptions,
  activeFilters,
  isPending,
  onFilterChange,
  onSearch,
  onClear,
}: BDCFiltersProps) {
  const [searchInput, setSearchInput] = useState(activeFilters.search);

  useEffect(() => {
    setSearchInput(activeFilters.search);
  }, [activeFilters.search]);

  const hasFilters = Boolean(
    activeFilters.sellerName ||
      activeFilters.city ||
      activeFilters.model ||
      activeFilters.search ||
      activeFilters.arrived,
  );

  return (
    <div className="space-y-3 rounded-xl border border-base-300/80 bg-base-100 p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Buscar por cliente, CPF ou chassi"
            placeholder="Buscar por cliente, CPF ou chassi"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSearch(searchInput.trim());
            }}
            className="pl-9 pr-9"
            disabled={isPending}
          />
          {searchInput && (
            <button
              type="button"
              aria-label="Limpar busca"
              disabled={isPending}
              onClick={() => {
                setSearchInput("");
                onSearch("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>
        <Button
          onClick={() => onSearch(searchInput.trim())}
          disabled={isPending}
          className="sm:min-w-28"
        >
          <SearchIcon className="mr-2 size-4" /> Buscar
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Select
          value={activeFilters.sellerName || "all"}
          onValueChange={(value) => onFilterChange("sellerName", value)}
          disabled={isPending}
        >
          <SelectTrigger
            aria-label="Filtrar por vendedor"
            className="min-h-11 w-full sm:w-52"
          >
            <SelectValue placeholder="Todos os vendedores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os vendedores</SelectItem>
            {filterOptions.sellers.map((seller) => (
              <SelectItem key={seller} value={seller}>
                {seller}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={activeFilters.city || "all"}
          onValueChange={(value) => onFilterChange("city", value)}
          disabled={isPending}
        >
          <SelectTrigger
            aria-label="Filtrar por cidade"
            className="min-h-11 w-full sm:w-52"
          >
            <SelectValue placeholder="Todas as cidades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as cidades</SelectItem>
            {filterOptions.cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={activeFilters.model || "all"}
          onValueChange={(value) => onFilterChange("model", value)}
          disabled={isPending}
        >
          <SelectTrigger
            aria-label="Filtrar por modelo"
            className="min-h-11 w-full sm:w-52"
          >
            <SelectValue placeholder="Todos os modelos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os modelos</SelectItem>
            {filterOptions.models.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSearchInput("");
              onClear();
            }}
            disabled={isPending}
          >
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
