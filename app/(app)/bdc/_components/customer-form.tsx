"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import {
  type CustomerFormData,
  customerSchema,
} from "@/validators/customer-schema";
import { ChassisStep } from "./chassis-step";
import { CustomerDataStep } from "./customer-data-step";
import { SidebarSummary } from "./sidebar-summary";

const defaultValues: CustomerFormData = {
  chassis: "",
  cpf: "",
  customerName: "",
  sellerName: "",
  city: "",
  model: "",
  billingDate: undefined,
  forecastDate: undefined,
  registrationStatus: "Sem Emplacamento",
  registrationDate: undefined,
};

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>;
  mode?: "create" | "edit";
  action: (data: unknown) => Promise<unknown>;
  searchChassisAction: (chassis: string) => Promise<any>; // Adicionado para isolar a busca
}

export function CustomerForm({
  initialData,
  mode = "create",
  action,
  searchChassisAction,
}: CustomerFormProps) {
  const isEditMode = mode === "edit";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // 1. Definição de Estado Inicial direto (Evita renders extras e useEffects)
  const [step, setStep] = useState<1 | 2>(isEditMode ? 2 : 1);
  const [sidebarData, setSidebarData] = useState<{
    found: boolean;
    forecastDate?: Date | null;
  }>({
    found: isEditMode,
    forecastDate: initialData?.forecastDate,
  });

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      ...defaultValues,
      ...initialData,
    },
  });

  const watchedValues = form.watch();

  // 2. Callback disparado quando o chassi é encontrado com sucesso no Passo 1
  const handleSearchResult = (
    found: boolean,
    data?: { model: string; forecastDate?: Date | null },
  ) => {
    setSidebarData({
      found,
      forecastDate: data?.forecastDate,
    });
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    // Limpa apenas o que foi preenchido para permitir nova busca do zero
    form.reset(defaultValues);
    setSidebarData({ found: false });
  };

  const handleSubmit = (data: CustomerFormData) => {
    startTransition(async () => {
      const result = await action(data);
      if (
        result &&
        typeof result === "object" &&
        "success" in result &&
        result.success
      ) {
        router.push("/bdc");
      }
    });
  };

  const showSidebar = isEditMode || step === 2;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <div className="flex-1">
        {/* Indicador de Passos Visual */}
        {!isEditMode && (
          <div className="mb-6 flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                step === 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/20 text-primary"
              }`}
            >
              1
            </div>
            <div
              className={`h-0.5 w-8 transition-colors ${
                step === 2 ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                step === 2
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* PASSO 1: Busca de Chassi */}
            {!isEditMode && step === 1 && (
              <ChassisStep
                form={form}
                onSearchResult={handleSearchResult}
                searchChassisAction={searchChassisAction}
              />
            )}

            {/* PASSO 2: Dados do Cliente */}
            {(isEditMode || step === 2) && (
              <CustomerDataStep
                form={form}
                onBack={!isEditMode ? handleBack : undefined}
                isPending={isPending}
              />
            )}
          </form>
        </Form>
      </div>

      {/* Resumo Lateral Dinâmico */}
      {showSidebar && (
        <SidebarSummary
          chassis={watchedValues.chassis}
          found={sidebarData.found}
          model={watchedValues.model}
          city={watchedValues.city}
          customerName={watchedValues.customerName}
          sellerName={watchedValues.sellerName}
          registrationStatus={watchedValues.registrationStatus}
          forecastDate={watchedValues.forecastDate || sidebarData.forecastDate}
        />
      )}
    </div>
  );
}
