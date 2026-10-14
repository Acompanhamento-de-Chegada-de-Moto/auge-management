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
        // Supplier labels use white QR modules on a black background.
        // Try each frame normally first, then with its colors inverted.
        class LabelQrReader extends BrowserQRCodeReader {
          override decodeFromCanvas(canvas: HTMLCanvasElement) {
            try {
              return super.decodeFromCanvas(canvas);
            } catch (error) {
              const context = canvas.getContext("2d");
              if (!context) throw error;
              const frame = context.getImageData(
                0,
                0,
                canvas.width,
                canvas.height,
              );
              for (let i = 0; i < frame.data.length; i += 4) {
                frame.data[i] = 255 - frame.data[i];
                frame.data[i + 1] = 255 - frame.data[i + 1];
                frame.data[i + 2] = 255 - frame.data[i + 2];
              }
              context.putImageData(frame, 0, 0);
              return super.decodeFromCanvas(canvas);
            }
          }
        }
        const reader = new LabelQrReader();
        controls = await reader.decodeFromConstraints(
          {
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
            audio: false,
          },
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
      <p className="text-sm">
        Aponte a câmera para o QR code da motocicleta. Mantenha toda a etiqueta
        visível, aguarde o foco e evite reflexos.
      </p>
      <video
        ref={video}
        muted
        playsInline
        className="aspect-square w-full rounded-lg bg-neutral object-contain"
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
