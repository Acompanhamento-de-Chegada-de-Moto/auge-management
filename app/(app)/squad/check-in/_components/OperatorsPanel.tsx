"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { operatorSchema } from "@/lib/check-in/schemas";
import {
  createOperatorAction,
  revokeOperatorAction,
  rotateOperatorPinAction,
} from "../_actions/operators";
import { DeleteOperatorDialog } from "./DeleteOperatorDialog";

type Operator = {
  id: string;
  name: string;
  identifier: string;
  active: boolean;
};
export function OperatorsPanel({ operators }: { operators: Operator[] }) {
  const router = useRouter();
  const [credential, setCredential] = useState<{
    pin: string;
    identifier: string;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const form = useForm<z.infer<typeof operatorSchema>>({
    resolver: zodResolver(operatorSchema),
    defaultValues: { name: "" },
  });
  async function create(values: z.infer<typeof operatorSchema>) {
    setCredential(null);
    const result = await createOperatorAction(values);
    if (result.status === "error") {
      setMessage(result.message ?? "Falha ao criar operador.");
      return;
    }
    setCredential(result.data as { pin: string; identifier: string });
    form.reset();
    setMessage("");
    router.refresh();
  }
  async function manage(operator: Operator, rotate: boolean) {
    setBusy(true);
    setCredential(null);
    setMessage("");
    try {
      const result = await (rotate
        ? rotateOperatorPinAction(operator.id)
        : revokeOperatorAction(operator.id));
      if (result.status === "error")
        setMessage(result.message ?? "Não foi possível alterar o acesso.");
      else {
        if (rotate)
          setCredential({
            identifier: operator.name,
            pin: (result.data as { pin: string }).pin,
          });
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex gap-4 text-sm">
        <Link className="link" href="/squad">
          Voltar à equipe
        </Link>
        <Link className="link" href="/check-in">
          Abrir check-in
        </Link>
      </div>
      {credential && (
        <div
          aria-live="polite"
          className="rounded-xl border border-success/30 bg-success/10 p-5"
        >
          <p className="font-semibold">
            PIN gerado para {credential.identifier}
          </p>
          <p className="my-3 font-mono text-3xl tracking-widest">
            {credential.pin}
          </p>
          <p className="text-sm">
            Entregue ao operador. Este PIN não poderá ser consultado novamente.
          </p>
          <button
            type="button"
            className="btn btn-sm mt-3"
            onClick={() => setCredential(null)}
          >
            Ocultar PIN
          </button>
        </div>
      )}
      {message && (
        <p role="alert" className="text-error">
          {message}
        </p>
      )}
      <form
        onSubmit={form.handleSubmit(create)}
        className="rounded-xl border border-base-300 bg-base-100 p-5"
      >
        <h2 className="mb-2 font-semibold">Acesso para quem só recebe motos</h2>
        <p className="mb-4 text-sm text-base-content/65">
          Quem já tem conta usa o login da plataforma. Para os demais, cadastre
          apenas o nome completo e entregue o PIN individual.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            Nome
            <input className="input w-full" {...form.register("name")} />
            <span className="block text-error">
              {form.formState.errors.name?.message}
            </span>
          </label>
        </div>
        <button
          className="btn btn-primary mt-4"
          disabled={form.formState.isSubmitting || busy}
          type="submit"
        >
          Cadastrar e gerar PIN
        </button>
      </form>
      <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
        <table className="table">
          <thead>
            <tr>
              <th>Operador</th>
              <th>Acesso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {operators.map((operator) => (
              <tr key={operator.id}>
                <td>{operator.name}</td>
                <td>
                  <span
                    className={`badge ${operator.active ? "badge-success" : "badge-ghost"}`}
                  >
                    {operator.active ? "Ativo" : "Revogado"}
                  </span>
                </td>
                <td>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      className="btn btn-sm"
                      type="button"
                      disabled={busy || form.formState.isSubmitting}
                      onClick={() => manage(operator, true)}
                    >
                      {operator.active
                        ? "Gerar novo PIN"
                        : "Reativar com novo PIN"}
                    </button>
                    {operator.active && (
                      <button
                        className="btn btn-sm btn-outline"
                        type="button"
                        disabled={busy || form.formState.isSubmitting}
                        onClick={() => manage(operator, false)}
                      >
                        Revogar
                      </button>
                    )}
                    <DeleteOperatorDialog
                      operator={operator}
                      disabled={busy || form.formState.isSubmitting}
                      onDeleted={() => setCredential(null)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!operators.length && (
          <p className="p-5 text-sm text-base-content/60">
            Nenhum operador cadastrado.
          </p>
        )}
      </div>
    </div>
  );
}
