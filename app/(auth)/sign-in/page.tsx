import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/[0.06] to-background px-4">
      <img src="/logo-auge.png" alt="Auge" className="mb-8 h-11 w-auto" />
      <LoginForm />
      <p className="mt-8 text-xs text-muted-foreground">
        &copy; 2026 Auge Management &mdash;{" "}
        <Link href="/politica-de-privacidade" className="hover:underline">
          Política de Privacidade
        </Link>
      </p>
    </div>
  );
}
