"use server";

import { headers } from "next/headers";
import { requireUser } from "@/app/data/require-user";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

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

    // Usa a API nativa do better-auth para criar o usuário corretamente
    await auth.api.signUpEmail({
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: "USER",
      },
      headers: await headers(),
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
