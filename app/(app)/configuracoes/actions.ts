"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/data/require-admin";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { upsertSetting } from "@/lib/data/settings";

export async function createUserAction(data: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    await requireAdmin();

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Este e-mail já está em uso.",
      };
    }

    await auth.api.createUser({
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
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

export async function updateContactSettingsAction(settings: {
  contactPhone: string;
  delayMessage: string;
  whatsappMessage: string;
}) {
  try {
    await requireAdmin();

    await upsertSetting("contact_phone", settings.contactPhone);
    await upsertSetting("delay_message", settings.delayMessage);
    await upsertSetting("whatsapp_message", settings.whatsappMessage);

    revalidatePath("/configuracoes");
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    return {
      success: false,
      error: "Erro ao salvar configurações.",
    };
  }
}
