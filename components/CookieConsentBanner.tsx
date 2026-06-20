"use client";

import { Cookie, X } from "lucide-react";
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
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-lg sm:flex-row sm:items-center sm:gap-4 sm:py-3">
        <div className="hidden shrink-0 sm:flex sm:size-9 sm:items-center sm:justify-center sm:rounded-lg sm:bg-primary/10">
          <Cookie className="size-4 text-primary" />
        </div>

        <p className="flex-1 text-sm leading-snug text-foreground">
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
            className="flex-1 sm:flex-none"
          >
            Recusar
          </Button>
          <Button
            onClick={handleAccept}
            size="sm"
            className="flex-1 sm:flex-none"
          >
            Aceitar
          </Button>
        </div>
      </div>
    </div>
  );
}
