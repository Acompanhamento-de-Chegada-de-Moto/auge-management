import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL não está configurada.");
}

const isProduction = process.env.NODE_ENV === "production";

// pg's connection-string parser can replace the ssl object when SSL query
// parameters are present. Keep the credentials/host, but apply TLS explicitly
// so production always verifies the database certificate.
const connectionString = (() => {
  if (!isProduction) return databaseUrl;

  const url = new URL(databaseUrl);
  for (const parameter of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) {
    url.searchParams.delete(parameter);
  }
  return url.toString();
})();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      ...(isProduction ? { ssl: { rejectUnauthorized: true } } : {}),
    }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
