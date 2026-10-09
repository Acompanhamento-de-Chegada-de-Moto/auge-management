import type { ClientRow } from "@/app/(app)/bdc/actions";

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
  totalPages: number;
  page: number;
  filterOptions: BDCFilterOptions;
  activeFilters: BDCActiveFilters;
}

export interface BDCFilterProps {
  filterOptions: BDCFilterOptions;
  activeFilters: BDCActiveFilters;
  isPending: boolean;
  onFilterChange: (
    key: "sellerName" | "city" | "model" | "arrived",
    value: string,
  ) => void;
  onSearch: (value: string) => void;
  onClear: () => void;
}
