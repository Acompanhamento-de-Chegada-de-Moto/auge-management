export interface MotorcycleLookupResult {
  model: string;
  forecastArrival: string | Date | null;
  forecastArrivalStatus: string | null;
}

export interface MotorcycleLookupState {
  searched: boolean;
  motorcycle: MotorcycleLookupResult | null;
}
