import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LoginForm from "./_components/LoginForm";

export const metadata: Metadata = {
  title: "Entrar",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = (await searchParams).next === "/check-in" ? "/check-in" : "/bdc";
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    return redirect(next);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-base-200 px-4 py-10">
      <div className="relative mb-7 flex flex-col items-center gap-3 text-center">
        <Image
          src="/logo-auge.png"
          alt="Auge"
          width={56}
          height={56}
          className="size-14 object-contain"
        />
        <p className="text-sm font-medium text-muted-foreground">
          Auge · Console de operações
        </p>
      </div>
      <LoginForm callbackURL={next} />
      <p className="relative mt-8 text-center text-xs text-muted-foreground">
        &copy; 2026 Auge Management
      </p>
    </main>
  );
}
