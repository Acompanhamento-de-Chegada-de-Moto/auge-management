import "dotenv/config";
import { prisma } from "../lib/db";

async function main() {
  if (!process.argv.includes("--confirm-homologation")) {
    throw new Error(
      "Informe --confirm-homologation. Exclui clientes, motos, operadores, recebimentos e sessões de check-in; preserva usuários e configurações.",
    );
  }
  const result = await prisma.$transaction(
    async (tx) => {
      const sessions = await tx.checkInSession.deleteMany();
      const receipts = await tx.motorcycleReceipt.deleteMany();
      const motorcycles = await tx.motorcycle.deleteMany();
      const clients = await tx.client.deleteMany();
      const operators = await tx.checkInOperator.deleteMany();
      return {
        sessions: sessions.count,
        receipts: receipts.count,
        motorcycles: motorcycles.count,
        clients: clients.count,
        operators: operators.count,
      };
    },
    { timeout: 60000 },
  );
  console.log(JSON.stringify({ deleted: result }, null, 2));
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
