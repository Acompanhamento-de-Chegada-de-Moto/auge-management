import type { Metadata } from "next";
import LoginForm from "./_components/LoginForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
    <div className="flex flex-col h-screen items-center justify-center">
      <LoginForm />
    </div>
  );
}
