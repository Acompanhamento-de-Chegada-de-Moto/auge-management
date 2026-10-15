import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ReloadButton } from "./ReloadButton";

export function TrackingShell({
  children,
  logoUrl,
  back = false,
}: {
  children: ReactNode;
  logoUrl: string | null;
  back?: boolean;
}) {
  return (
    <main className="min-h-full bg-base-200/50">
      <header className="border-b border-base-300 bg-base-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <Link
            href="/tracking"
            className="flex min-w-0 items-center gap-3 rounded focus-visible:outline-2 focus-visible:outline-primary"
          >
            <Image
              src={logoUrl || "/logo-auge.png"}
              alt="Auge"
              width={40}
              height={40}
              className="size-10 shrink-0 object-contain"
            />
            <span className="text-sm font-semibold sm:text-base">
              Acompanhamento de motocicletas
            </span>
          </Link>
          <ReloadButton />
        </div>
      </header>
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
        {back && (
          <Link
            href="/tracking"
            className="inline-flex min-h-10 items-center gap-2 rounded text-sm text-base-content/65 hover:text-base-content focus-visible:outline-2 focus-visible:outline-primary"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Nova consulta
          </Link>
        )}
        {children}
      </div>
      <footer className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 pb-8 text-xs text-base-content/55 sm:px-6">
        <p>Auge · Acompanhamento de motocicletas</p>
        <Link
          href="/bdc"
          className="inline-flex min-h-10 items-center rounded hover:text-base-content focus-visible:outline-2 focus-visible:outline-primary"
        >
          Área administrativa
        </Link>
      </footer>
    </main>
  );
}
