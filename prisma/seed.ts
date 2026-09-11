import "dotenv/config";
import { createUser } from "@/lib/data/user";
import { prisma } from "@/lib/db";

async function main() {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error(
      "Missing admin environment variables. Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env",
    );
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists for ${email}. Skipping.`);
    return;
  }

  await createUser({ name, email, password, role: "ADMIN" });
  console.log(`Created admin user ${name} <${email}>`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
