import dayjs from "dayjs";
import { AlertTriangle, MessageCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { stripPhone } from "@/lib/utils";

interface DelayAlertProps {
  forecastDate: Date;
  forecastArrivalStatus?: string | null;
  contactPhone: string | null;
  delayMessage: string | null;
  whatsappMessage?: string | null;
  clientName?: string;
  model?: string;
  chassis?: string;
}

export function DelayAlert({
  forecastDate,
  forecastArrivalStatus,
  contactPhone,
  delayMessage,
  whatsappMessage,
  clientName,
  model,
  chassis,
}: DelayAlertProps) {
  if (forecastArrivalStatus === "ARRIVED") return null;

  const hoje = dayjs().startOf("day");
  const prazo = dayjs(forecastDate).startOf("day");

  if (prazo.isAfter(hoje) || prazo.isSame(hoje, "day")) return null;

  const dataFormatada = dayjs(forecastDate).format("DD/MM/YYYY");
  const phone = contactPhone || "(telefone não configurado)";

  const mensagem =
    delayMessage?.replace("{data}", dataFormatada).replace("{phone}", phone) ??
    `Sua moto atrasou! O prazo era ${dataFormatada}. Entre em contato: ${phone}`;

  const rawPhone = contactPhone ? stripPhone(contactPhone) : null;
  let whatsappUrl: string | null = null;

  if (rawPhone && whatsappMessage) {
    const text = whatsappMessage
      .replace("{cliente}", clientName ?? "")
      .replace("{modelo}", model ?? "")
      .replace("{chassi}", chassis ?? "")
      .replace("{data}", dataFormatada)
      .replace("{phone}", phone);

    whatsappUrl = `https://wa.me/55${rawPhone}?text=${encodeURIComponent(text)}`;
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="size-4" />
      <AlertTitle>Moto atrasada</AlertTitle>
      <AlertDescription>
        <p>{mensagem}</p>
        {whatsappUrl && (
          <Button variant="outline" size="sm" className="mt-3" asChild>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-1.5 size-4 text-green-600" />
              Falar no WhatsApp
            </a>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
