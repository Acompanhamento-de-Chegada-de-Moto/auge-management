"use client";

import { Button } from "@/components/ui/button";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section
      className="mx-auto flex max-w-xl flex-col items-center gap-4 p-8 text-center"
      aria-live="assertive"
    >
      <h2 className="text-xl font-semibold">
        Não foi possível carregar esta página
      </h2>
      <p className="text-base-content/65">
        Tente novamente para atualizar os dados.
      </p>
      <Button onClick={reset}>Tentar novamente</Button>
    </section>
  );
}
