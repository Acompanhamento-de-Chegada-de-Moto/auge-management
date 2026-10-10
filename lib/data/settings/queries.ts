import "server-only";

import { prisma } from "@/lib/db";

export async function getSetting(key: string): Promise<string | null> {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return setting?.value ?? null;
}

export async function getContactPhone(): Promise<string | null> {
  return getSetting("contact_phone");
}

export async function getDelayMessage(): Promise<string | null> {
  return getSetting("delay_message");
}

export async function getWhatsAppMessage(): Promise<string | null> {
  return getSetting("whatsapp_message");
}
