import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LoginForm from "./_components/LoginForm";

export const metadata: Metadata = {
  title: "Entrar",
};

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    return redirect("/bdc");
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary/[0.08] via-background to-muted/40 px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-primary/[0.08] blur-3xl"
      />
      <div className="relative mb-7 flex flex-col items-center gap-3 text-center">
        <Image
          src="/logo-auge.png"
          alt="Auge"
          width={56}
          height={56}
          className="size-14 object-contain"
        />
        <p className="text-sm font-medium text-muted-foreground">
          Acompanhamento de chegada de motocicletas
        </p>
      </div>
      <LoginForm />
      <p className="relative mt-8 text-center text-xs text-muted-foreground">
        &copy; 2026 Auge Management
      </p>
    </main>
  );
}
