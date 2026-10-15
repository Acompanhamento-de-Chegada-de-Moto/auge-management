import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaConstructor: typeof PrismaClient | undefined;
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL não está configurada.");
}

const isProduction = process.env.NODE_ENV === "production";
const databaseCa = process.env.DATABASE_SSL_CA?.replace(/\\n/g, "\n");

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

// HMR can reload the generated client while retaining the previous global
// instance. Reuse it only when it belongs to the current generated class.
const cachedPrisma = isProduction ? undefined : globalForPrisma.prisma;
export const prisma =
  cachedPrisma && globalForPrisma.prismaConstructor === PrismaClient
    ? cachedPrisma
    : new PrismaClient({
        adapter: new PrismaPg({
          connectionString,
          ...(isProduction
            ? {
                ssl: {
                  rejectUnauthorized: true,
                  ...(databaseCa ? { ca: databaseCa } : {}),
                },
              }
            : {}),
        }),
      });

if (process.env.NODE_ENV !== "production") {
  if (cachedPrisma && cachedPrisma !== prisma) {
    void cachedPrisma.$disconnect().catch(() => {});
  }
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaConstructor = PrismaClient;
}
