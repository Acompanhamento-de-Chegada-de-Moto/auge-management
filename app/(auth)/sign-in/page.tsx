import type { Metadata } from "next";
import LoginForm from "./_components/login-form";

export const metadata: Metadata = {
  title: "Entrar",
};

export default async function LoginPage() {
  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <LoginForm />
    </div>
  );
}
