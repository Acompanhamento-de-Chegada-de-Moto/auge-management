import type { Metadata } from "next";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { getSetting } from "@/lib/data/settings";
import { ContactSettingsForm } from "../_components/contact-settings-form";

export const metadata: Metadata = {
  title: "Configurações do Sistema",
};

export default async function SistemaPage() {
  await requireAdmin();

  const contactPhone = (await getSetting("contact_phone")) ?? "";
  const delayMessage = (await getSetting("delay_message")) ?? "";
  const whatsappMessage = (await getSetting("whatsapp_message")) ?? "";

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
        <p className="text-muted-foreground">
          Configure o telefone de contato e as mensagens.
        </p>
      </div>

      <ContactSettingsForm
        initialPhone={contactPhone}
        initialMessage={delayMessage}
        initialWhatsAppMessage={whatsappMessage}
      />
    </>
  );
}
