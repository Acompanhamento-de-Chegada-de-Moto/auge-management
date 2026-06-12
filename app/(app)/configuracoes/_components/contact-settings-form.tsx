"use client";

import { CheckCircle2Icon, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { maskPhone } from "@/lib/utils";
import { updateContactSettingsAction } from "../actions";

interface ContactSettingsFormProps {
  initialPhone: string;
  initialMessage: string;
  initialWhatsAppMessage: string;
}

export function ContactSettingsForm({
  initialPhone,
  initialMessage,
  initialWhatsAppMessage,
}: ContactSettingsFormProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [message, setMessage] = useState(initialMessage);
  const [whatsappMessage, setWhatsappMessage] = useState(initialWhatsAppMessage);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(maskPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const result = await updateContactSettingsAction({
      contactPhone: phone,
      delayMessage: message,
      whatsappMessage,
    });

    setSaving(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || "Erro ao salvar");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
          <CheckCircle2Icon className="size-4 shrink-0" />
          Configurações salvas com sucesso!
        </div>
      )}

      {error && (
        <p className="text-sm font-medium text-red-600">{error}</p>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Telefone de contato</label>
        <Input
          placeholder="(11) 99999-8888"
          value={phone}
          onChange={handlePhoneChange}
          disabled={saving}
          className="max-w-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Mensagem de atraso</label>
        <textarea
          placeholder="Sua moto atrasou! O prazo era {data}. Entre em contato: {phone}"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          disabled={saving}
          className="flex w-full max-w-lg min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="text-xs text-muted-foreground">
          Usa <code>{`{data}`}</code> e <code>{`{phone}`}</code>.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Mensagem do WhatsApp</label>
        <textarea
          placeholder="Olá, meu nome é {cliente}. Gostaria de saber sobre minha moto {modelo}, chassi {chassi}. A previsão era {data}."
          value={whatsappMessage}
          onChange={(e) => setWhatsappMessage(e.target.value)}
          rows={3}
          disabled={saving}
          className="flex w-full max-w-lg min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="text-xs text-muted-foreground">
          Usa <code>{`{cliente}`}</code>, <code>{`{modelo}`}</code>,{" "}
          <code>{`{chassi}`}</code>, <code>{`{data}`}</code>,{" "}
          <code>{`{phone}`}</code>.
        </p>
      </div>

      <Button type="submit" disabled={saving}>
        <Save className="mr-2 size-4" />
        {saving ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
