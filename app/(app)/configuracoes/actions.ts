"use server";

import { requireUser } from "@/app/data/require-user";
import { prisma } from "@/lib/db";
import bcryptjs from "bcryptjs";

export async function createUserAction(data: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    // Verifica se quem chama é ADMIN
    await requireUser();

    // Verifica se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Este e-mail já está em uso.",
      };
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);

    // Cria o usuário com role USER
    await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        emailVerified: true,
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Cria a account com a senha hashed para o better-auth
    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: data.email,
        providerId: "credential",
        userId: (await prisma.user.findUnique({
          where: { email: data.email },
        }))!.id,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return {
      success: false,
      error: "Erro ao criar usuário. Tente novamente.",
    };
  }
}
