import { prisma } from "../db";

export async function getSetting(key: string): Promise<string | null> {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return setting?.value ?? null;
}

export async function upsertSetting(key: string, value: string) {
  return prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
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
