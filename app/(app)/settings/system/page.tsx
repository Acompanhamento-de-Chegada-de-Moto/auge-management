import { requireAdmin } from "@/app/data/admin/require-admin";
import { getSetting } from "@/lib/data/settings";
import { ContactSettingsForm } from "../_components/ContactSettingsForm";

export default async function SistemaPage() {
  await requireAdmin();

  const contactPhone = (await getSetting("contact_phone")) ?? "";
  const delayMessage = (await getSetting("delay_message")) ?? "";
  const whatsappMessage = (await getSetting("whatsapp_message")) ?? "";

  return (
    <ContactSettingsForm
      initialPhone={contactPhone}
      initialMessage={delayMessage}
      initialWhatsAppMessage={whatsappMessage}
    />
  );
}
