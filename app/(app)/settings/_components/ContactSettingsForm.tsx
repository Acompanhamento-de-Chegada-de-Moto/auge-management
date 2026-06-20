"use client";

import {
  CheckCircle2Icon,
  Loader2,
  MessageSquareText,
  Phone,
  Save,
} from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { maskPhone } from "@/lib/utils";
import { saveSettingAction } from "@/app/(app)/settings/actions";

interface ContactSettingsFormProps {
  initialPhone: string;
  initialMessage: string;
  initialWhatsAppMessage: string;
}

function renderPreview(template: string, sample: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, key) => sample[key] ?? match);
}

export function ContactSettingsForm({
  initialPhone,
  initialMessage,
  initialWhatsAppMessage,
}: ContactSettingsFormProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [message, setMessage] = useState(initialMessage);
  const [whatsappMessage, setWhatsappMessage] = useState(
    initialWhatsAppMessage,
  );
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const phoneId = useId();
  const messageId = useId();
  const whatsappId = useId();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(maskPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await Promise.all([
        saveSettingAction("contact_phone", phone),
        saveSettingAction("delay_message", message),
        saveSettingAction("whatsapp_message", whatsappMessage),
      ]);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Erro ao salvar configurações. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const delayPreview = renderPreview(message, {
    data: "20/06/2026",
    phone: phone || "(88) 99999-0000",
  });

  const whatsappPreview = renderPreview(whatsappMessage, {
    cliente: "João Silva",
    modelo: "Honda CG 160",
    chassi: "9BWHE21JX24060961",
    data: "20/06/2026",
    phone: phone || "(88) 99999-0000",
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300"
        >
          <CheckCircle2Icon className="size-4 shrink-0" />
          Configurações salvas com sucesso!
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <Card>
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Phone className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Contato</CardTitle>
            <CardDescription>
              Número usado nas mensagens enviadas ao cliente
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm space-y-1.5">
            <label htmlFor={phoneId} className="text-sm font-medium">
              Telefone de contato
            </label>
            <Input
              id={phoneId}
              placeholder="(11) 99999-8888"
              value={phone}
              onChange={handlePhoneChange}
              disabled={saving}
              inputMode="numeric"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MessageSquareText className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Mensagens automáticas</CardTitle>
            <CardDescription>
              Use variáveis entre chaves para personalizar o texto
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1.5">
            <label htmlFor={messageId} className="text-sm font-medium">
              Mensagem de atraso
            </label>
            <textarea
              id={messageId}
              placeholder="Sua moto atrasou! O prazo era {data}. Entre em contato: {phone}"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              disabled={saving}
              aria-describedby={`${messageId}-hint`}
              className="flex min-h-[72px] w-full max-w-lg rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p
              id={`${messageId}-hint`}
              className="text-xs text-muted-foreground"
            >
              Usa <code>{`{data}`}</code> e <code>{`{phone}`}</code>.
            </p>
            {message && (
              <div className="max-w-lg rounded-md border border-dashed bg-muted/40 p-2.5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  Pré-visualização:{" "}
                </span>
                {delayPreview}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor={whatsappId} className="text-sm font-medium">
              Mensagem do WhatsApp
            </label>
            <textarea
              id={whatsappId}
              placeholder="Olá, meu nome é {cliente}. Gostaria de saber sobre minha moto {modelo}, chassi {chassi}. A previsão era {data}."
              value={whatsappMessage}
              onChange={(e) => setWhatsappMessage(e.target.value)}
              rows={3}
              disabled={saving}
              aria-describedby={`${whatsappId}-hint`}
              className="flex min-h-[72px] w-full max-w-lg rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p
              id={`${whatsappId}-hint`}
              className="text-xs text-muted-foreground"
            >
              Usa <code>{`{cliente}`}</code>, <code>{`{modelo}`}</code>,{" "}
              <code>{`{chassi}`}</code>, <code>{`{data}`}</code>,{" "}
              <code>{`{phone}`}</code>.
            </p>
            {whatsappMessage && (
              <div className="max-w-lg rounded-md border border-dashed bg-muted/40 p-2.5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  Pré-visualização:{" "}
                </span>
                {whatsappPreview}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="min-w-[140px]">
          {saving ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
