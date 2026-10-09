export type ClientRow = {
  id: string;
  cpf: string;
  name: string;
  sellersName: string;
  city: string;
  billingDate: Date | null;
  motorcycle: {
    id: string;
    chassi: string;
    model: string;
    forecastArrival: Date | null;
    forecastArrivalStatus: string;
    registrationStatus: string | null;
    registrationDate: Date | null;
  } | null;
  rowKey: string;
};

export interface PaginatedResult {
  rows: ClientRow[];
  totalClients: number;
  totalPages: number;
  page: number;
  statusCounts: {
    total: number;
    arrived: number;
    waiting: number;
  };
  filterOptions: {
    sellers: string[];
    cities: string[];
    models: string[];
  };
}

export interface GetClientsPaginatedParams {
  page: number;
  pageSize?: number;
  sellerName?: string;
  city?: string;
  model?: string;
  search?: string;
  arrived?: "true" | "false";
}
