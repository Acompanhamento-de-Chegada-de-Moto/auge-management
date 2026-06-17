import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Novo Cliente",
};

export default function NovoClientePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cadastro de Cliente</h1>
        <p className="text-muted-foreground">
          Consulte o chassi e preencha os dados do cliente.
        </p>
      </div>
    </div>
  );
}
