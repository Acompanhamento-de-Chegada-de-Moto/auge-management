import { prisma } from "@/lib/db";

export interface DashboardSummary {
  totalClients: number;
  totalMotorcycles: number;
  arrivalStatus: {
    emTransito: number;
    chegou: number;
    atrasada: number;
  };
  registrationStatus: {
    noPlate: number;
    plating: number;
    plated: number;
  };
  topSellers: Array<{ sellersName: string; count: number }>;
  models: Array<{ model: string; count: number }>;
  cities: Array<{ city: string; count: number }>;
  recentClients: number;
  recentMotorcycles: number;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);

  const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalClients,
    totalMotorcycles,
    emTransito,
    chegou,
    atrasada,
    registrationStatusCounts,
    topSellers,
    models,
    cities,
    recentClients,
    recentMotorcycles,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.motorcycle.count(),

    prisma.motorcycle.count({
      where: {
        OR: [
          { forecastArrival: null, forecastArrivalStatus: "NO_INFORMATION" },
          { forecastArrival: { gt: hoje }, forecastArrivalStatus: "NO_INFORMATION" },
        ],
      },
    }),

    prisma.motorcycle.count({
      where: {
        OR: [
          { forecastArrivalStatus: "ARRIVED" },
          { forecastArrival: { lte: hoje }, forecastArrivalStatus: "NO_INFORMATION" },
        ],
      },
    }),

    prisma.motorcycle.count({
      where: {
        OR: [
          { forecastArrivalStatus: "DELAYED" },
          { forecastArrival: { lt: hoje }, forecastArrivalStatus: "NO_INFORMATION" },
        ],
      },
    }),

    prisma.motorcycle.groupBy({
      by: ["registrationStatus"],
      _count: true,
    }),

    prisma.client.groupBy({
      by: ["sellersName"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),

    prisma.motorcycle.groupBy({
      by: ["model"],
      _count: true,
      orderBy: { _count: { model: "desc" } },
      take: 10,
    }),

    prisma.client.groupBy({
      by: ["city"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),

    prisma.client.count({
      where: { createdAt: { gte: trintaDiasAtras } },
    }),

    prisma.motorcycle.count({
      where: { createdAt: { gte: trintaDiasAtras } },
    }),
  ]);

  const registrationStatus = {
    noPlate: 0,
    plating: 0,
    plated: 0,
  };

  for (const item of registrationStatusCounts) {
    if (item.registrationStatus === "NO_PLATE") registrationStatus.noPlate = item._count;
    else if (item.registrationStatus === "PLATING") registrationStatus.plating = item._count;
    else if (item.registrationStatus === "PLATED") registrationStatus.plated = item._count;
  }

  return {
    totalClients,
    totalMotorcycles,
    arrivalStatus: { emTransito, chegou, atrasada },
    registrationStatus,
    topSellers: topSellers.map((s) => ({ sellersName: s.sellersName, count: s._count.id })),
    models: models.map((m) => ({ model: m.model, count: m._count })),
    cities: cities.map((c) => ({ city: c.city, count: c._count.id })),
    recentClients,
    recentMotorcycles,
  };
}
