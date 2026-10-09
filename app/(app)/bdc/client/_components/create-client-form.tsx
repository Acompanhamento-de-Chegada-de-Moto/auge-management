"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { CustomerSection } from "@/app/(app)/bdc/client/_components/customer-section";
import { MotorcycleSection } from "@/app/(app)/bdc/client/_components/motorcycle-section";
import { RegistrationSection } from "@/app/(app)/bdc/client/_components/registration-section";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { apiMutation } from "@/lib/api/client";
import {
  type CustomerFormData,
  customerSchema,
} from "@/validators/customer-schema";

const defaultValues: CustomerFormData = {
  customerName: "",
  cpf: "",
  sellerName: "",
  city: "",
  model: "",
  chassis: "",
  billingDate: undefined,
  forecastDate: undefined,
  registrationStatus: "Sem Emplacamento",
  registrationDate: undefined,
  arrivalStatus: "Sem Informação",
};

export function CreateClientForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [motorcycleFound, setMotorcycleFound] = useState(false);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues,
    shouldFocusError: true,
  });

  function handleSubmit(data: CustomerFormData) {
    startTransition(async () => {
      try {
        const result = await apiMutation("/api/v1/bdc/clients", "POST", data);

        if (result.status === "success") {
          toast.success(result.message || "Cliente cadastrado com sucesso!");
          router.push("/bdc");
          return;
        }

        toast.error(result.message || "Não foi possível salvar o cliente.");
      } catch {
        toast.error("Ocorreu um erro inesperado ao salvar o cliente.");
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-5"
          aria-busy={pending}
        >
          <div className="space-y-6">
            <CustomerSection form={form} />
            <MotorcycleSection
              form={form}
              onLookupResult={setMotorcycleFound}
            />
          </div>

          <RegistrationSection form={form} motorcycleFound={motorcycleFound} />

          <div className="flex flex-col-reverse gap-3 border-t border-base-300/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-base-content/60">
              Os campos marcados com * são obrigatórios.
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button variant="outline" asChild disabled={pending}>
                <Link href="/bdc">
                  <ArrowLeft className="mr-2 size-4" aria-hidden="true" />
                  Cancelar
                </Link>
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <Loader2
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Save className="mr-2 size-4" aria-hidden="true" />
                )}
                {pending ? "Salvando…" : "Cadastrar cliente"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
