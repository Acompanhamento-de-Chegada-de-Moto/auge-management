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
  onFilterChange: (
    key: "sellerName" | "city" | "model" | "arrived",
    value: string,
  ) => void;
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

  function handleSearch() {
    onSearch(searchInput.trim());
  }

  function handleClear() {
    setSearchInput("");
    onClear();
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Select
        value={activeFilters.sellerName || "all"}
        onValueChange={(value) => onFilterChange("sellerName", value)}
        disabled={isPending}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Vendedor" />
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
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Cidade" />
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
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Modelo" />
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

      <Select
        value={activeFilters.arrived || "all"}
        onValueChange={(value) => onFilterChange("arrived", value)}
        disabled={isPending}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Chegada" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="true">Chegou</SelectItem>
          <SelectItem value="false">Não chegou</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative w-full sm:w-[220px]">
        <button
          type="button"
          onClick={handleSearch}
          disabled={isPending}
          aria-label="Buscar clientes"
          className="absolute left-2 top-1/2 -translate-y-1/2 disabled:opacity-50"
        >
          <SearchIcon className="size-4 text-muted-foreground hover:text-foreground" />
        </button>

        <Input
          placeholder="Buscar nome, CPF ou chassi"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSearch();
            }
          }}
          className="pl-8 pr-8"
          disabled={isPending}
        />

        {searchInput && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              onSearch("");
            }}
            disabled={isPending}
            aria-label="Limpar busca"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleClear}
        disabled={isPending}
      >
        Limpar filtros
      </Button>
    </div>
  );
}
