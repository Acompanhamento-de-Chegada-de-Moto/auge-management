"use client";
import { useEffect, useRef, useState } from "react";

export function QrScanner({
  onRead,
  onClose,
}: {
  onRead: (value: string) => void;
  onClose: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    let detected = false;
    let controls: { stop: () => void } | undefined;
    async function start() {
      try {
        const { BrowserQRCodeReader } = await import("@zxing/browser");
        if (cancelled || !video.current) return;
        const reader = new BrowserQRCodeReader();
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: "environment" } }, audio: false },
          video.current,
          (result, _error, currentControls) => {
            if (result && !detected && !cancelled) {
              detected = true;
              currentControls.stop();
              onRead(result.getText());
            }
          },
        );
        if (cancelled || detected) controls.stop();
      } catch {
        if (!cancelled)
          setError(
            "Não foi possível abrir a câmera. Autorize o acesso ou digite o chassi. No celular, use uma conexão HTTPS.",
          );
      }
    }
    void start();
    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [onRead]);
  return (
    <section
      className="space-y-3 rounded-xl border border-base-300 bg-base-100 p-4"
      aria-label="Leitor de QR code"
    >
      <p className="text-sm">Aponte a câmera para o QR code da motocicleta.</p>
      <video
        ref={video}
        muted
        playsInline
        className="aspect-square w-full rounded-lg bg-neutral object-cover"
      >
        <track kind="captions" />
      </video>
      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
      <button
        type="button"
        className="btn btn-outline w-full"
        onClick={onClose}
      >
        Fechar câmera
      </button>
    </section>
  );
}
