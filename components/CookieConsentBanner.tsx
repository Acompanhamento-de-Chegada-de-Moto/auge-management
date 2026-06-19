"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getCookieConsent, setCookieConsent } from "@/lib/cookies";
import { Cookie } from "lucide-react";
import { useEffect, useState } from "react";

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
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <Card className="mx-auto max-w-3xl shadow-xl border-border/60">
        <CardContent className="flex items-start gap-4 pt-6">
          <div className="hidden shrink-0 sm:block">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Cookie className="size-5 text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm leading-relaxed text-foreground">
              Utilizamos cookies essenciais para o funcionamento da plataforma,
              incluindo autenticação e segurança. Ao clicar em{" "}
              <strong>&quot;Aceitar&quot;</strong>, você concorda com o uso de
              todos os cookies. Caso prefira{" "}
              <strong>&quot;Recusar&quot;</strong>, apenas os cookies
              estritamente necessários serão utilizados.
            </p>
            <p className="text-xs text-muted-foreground">
              Você pode alterar sua preferência a qualquer momento nas
              configurações do navegador.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 pb-6">
          <Button variant="outline" onClick={handleReject} size="sm">
            Recusar
          </Button>
          <Button onClick={handleAccept} size="sm">
            Aceitar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
