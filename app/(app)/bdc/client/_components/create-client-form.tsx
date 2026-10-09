"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Check,
  Loader2,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { SidebarSummary } from "@/app/(app)/bdc/_components/SidebarSummary";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  type CustomerFormData,
  customerSchema,
} from "@/validators/customer-schema";
import { CustomerSection } from "./customer-section";
import { FormStepper, type WizardStep } from "./form-stepper";
import { MotorcycleSection } from "./motorcycle-section";
import { RegistrationSection } from "./registration-section";
import type { MotorcycleLookupResult, MotorcycleLookupState } from "./types";

interface CreateClientFormProps {
  action: (
    data: CustomerFormData,
  ) => Promise<{ status: string; message: string }>;
  searchChassisAction: (
    chassis: string,
  ) => Promise<MotorcycleLookupResult | null>;
}

const steps: WizardStep[] = [
  { id: 1, title: "Motocicleta", icon: Bike },
  { id: 2, title: "Cliente e Emplacamento", icon: ShieldCheck },
];

export function CreateClientForm({
  action,
  searchChassisAction,
}: CreateClientFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [lookup, setLookup] = useState<MotorcycleLookupState>({
    searched: false,
    motorcycle: null,
  });

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
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
    },
  });

  const watchedValues = form.watch();
  const motorcycleFound = lookup.motorcycle !== null;

  async function handleContinue() {
    const isStepOneValid = await form.trigger(["chassis", "model"]);

    if (isStepOneValid) {
      setStep(2);
    }
  }

  function handleSubmit(data: CustomerFormData) {
    startTransition(async () => {
      try {
        const result = await action(data);

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
    <div className="mx-auto w-full max-w-360 space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormStepper
            steps={steps}
            currentStep={step}
            onStepSelect={(selected) => {
              if (selected < step) {
                setStep(selected);
              }
            }}
          />

          <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="order-2 min-w-0 space-y-5 xl:order-1">
              {step === 1 ? (
                <MotorcycleSection
                  form={form}
                  searchChassisAction={searchChassisAction}
                  onLookupResult={setLookup}
                />
              ) : (
                <>
                  <CustomerSection form={form} />

                  <RegistrationSection
                    form={form}
                    motorcycleFound={motorcycleFound}
                  />
                </>
              )}

              <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                {step === 1 ? (
                  <>
                    <div className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Consulte o chassi no estoque ou informe o modelo
                        manualmente para continuar.
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="lg"
                      onClick={() => void handleContinue()}
                      className="w-full sm:w-auto sm:min-w-48"
                    >
                      Continuar
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Confira os dados antes de concluir o cadastro.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => setStep(1)}
                        className="w-full sm:w-auto"
                      >
                        <ArrowLeft className="mr-2 size-4" />
                        Voltar
                      </Button>

                      <Button
                        type="submit"
                        disabled={pending}
                        size="lg"
                        className="w-full sm:w-auto sm:min-w-48"
                      >
                        {pending ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 size-4" />
                        )}
                        {pending ? "Salvando..." : "Salvar cliente"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <aside
              className={`order-1 min-w-0 xl:order-2 xl:sticky xl:top-6 ${
                step === 1 ? "hidden xl:block" : ""
              }`}
            >
              <SidebarSummary
                chassis={watchedValues.chassis}
                found={motorcycleFound}
                searched={lookup.searched}
                model={watchedValues.model}
                city={watchedValues.city}
                customerName={watchedValues.customerName}
                sellerName={watchedValues.sellerName}
                registrationStatus={watchedValues.registrationStatus}
                forecastDate={watchedValues.forecastDate}
                arrivalStatus={watchedValues.arrivalStatus}
              />
            </aside>
          </div>
        </form>
      </Form>
    </div>
  );
}
