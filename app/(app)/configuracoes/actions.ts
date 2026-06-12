"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/app/data/require-user";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { upsertSetting } from "@/lib/data/settings";

export async function createUserAction(data: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    await requireUser();

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Este e-mail já está em uso.",
      };
    }

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

export async function updateContactSettingsAction(settings: {
  contactPhone: string;
  delayMessage: string;
  whatsappMessage: string;
}) {
  try {
    await requireUser();

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
