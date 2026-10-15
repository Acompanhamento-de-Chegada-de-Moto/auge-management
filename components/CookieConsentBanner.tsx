"use client";

import { Cookie } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getCookieConsent, setCookieConsent } from "@/lib/cookies";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (consent === null) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    setCookieConsent("accepted");
    setVisible(false);
  }

  function handleReject() {
    setCookieConsent("rejected");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-5"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-border/60 bg-background/90 p-4 shadow-2xl shadow-black/10 backdrop-blur-2xl sm:flex-row sm:items-center sm:gap-6 sm:px-5">
        <div className="hidden shrink-0 sm:flex sm:size-10 sm:items-center sm:justify-center sm:rounded-full sm:bg-muted">
          <Cookie className="size-4 text-muted-foreground" />
        </div>

        <p className="flex-1 text-sm leading-relaxed text-foreground">
          Usamos cookies essenciais para autenticação e segurança da plataforma.{" "}
          <span className="text-muted-foreground">
            Você pode recusar os opcionais quando quiser.
          </span>
        </p>

        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            onClick={handleReject}
            size="sm"
            className="min-h-10 flex-1 rounded-full px-5 sm:flex-none"
          >
            Recusar
          </Button>
          <Button
            onClick={handleAccept}
            size="sm"
            className="min-h-10 flex-1 rounded-full px-5 sm:flex-none"
          >
            Aceitar
          </Button>
        </div>
      </div>
    </div>
  );
}
