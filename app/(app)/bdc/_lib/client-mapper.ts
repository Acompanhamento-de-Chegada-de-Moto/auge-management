import type { ClientRow } from "./types";

interface MotorcycleRecord {
  id: string;
  chassi: string;
  model: string;
  forecastArrival: Date | null;
  forecastArrivalStatus: string;
  registrationStatus: string | null;
  registrationDate: Date | null;
}

interface ClientRecord {
  id: string;
  document: string;
  name: string;
  sellersName: string;
  city: string;
  billingDate: Date | null;
  motorcycles: MotorcycleRecord[];
}

export function mapClientsToRows(clients: ClientRecord[]): ClientRow[] {
  return clients.flatMap((client): ClientRow[] => {
    if (client.motorcycles.length === 0) {
      return [
        {
          id: client.id,
          document: client.document,
          name: client.name,
          sellersName: client.sellersName,
          city: client.city,
          billingDate: client.billingDate,
          motorcycle: null,
          rowKey: `${client.id}-none`,
        },
      ];
    }

    return client.motorcycles.map((motorcycle) => ({
      id: client.id,
      document: client.document,
      name: client.name,
      sellersName: client.sellersName,
      city: client.city,
      billingDate: client.billingDate,
      motorcycle: {
        id: motorcycle.id,
        chassi: motorcycle.chassi,
        model: motorcycle.model,
        forecastArrival: motorcycle.forecastArrival,
        forecastArrivalStatus: motorcycle.forecastArrivalStatus,
        registrationStatus: motorcycle.registrationStatus,
        registrationDate: motorcycle.registrationDate,
      },
      rowKey: `${client.id}-${motorcycle.id}`,
    }));
  });
}
