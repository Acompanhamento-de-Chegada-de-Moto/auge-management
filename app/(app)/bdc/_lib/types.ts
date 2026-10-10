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
