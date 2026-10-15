import type { ClientRow } from "./_lib/types";

export interface BDCFilterOptions {
  sellers: string[];
  cities: string[];
  models: string[];
}

export interface BDCActiveFilters {
  sellerName: string;
  city: string;
  model: string;
  search: string;
  arrived: string;
}

export interface BDCTableProps {
  rows: ClientRow[];
  totalClients: number;
  totalPages: number;
  page: number;
  statusCounts: {
    total: number;
    arrived: number;
    waiting: number;
  };
  filterOptions: BDCFilterOptions;
  activeFilters: BDCActiveFilters;
}

export interface BDCFilterProps {
  filterOptions: BDCFilterOptions;
  activeFilters: BDCActiveFilters;
  isPending: boolean;
  onFilterChange: (key: "sellerName" | "city" | "model", value: string) => void;
  onSearch: (value: string) => void;
  onClear: () => void;
}
