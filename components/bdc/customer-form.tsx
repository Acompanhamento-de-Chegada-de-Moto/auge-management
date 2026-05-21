"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import {
  customerSchema,
  type CustomerFormData,
} from "@/validators/customer-schema";
import { ChassisStep } from "./chassis-step";
import { CustomerDataStep } from "./customer-data-step";
import { SidebarResumo } from "./sidebar-resumo";

const defaultValues: CustomerFormData = {
  chassi: "",
  cliente: "",
  vendedor: "",
  cidade: "",
  modelo: "",
  dataFaturamento: undefined,
  motoChegou: false,
  dataChegada: undefined,
  statusRegistro: "Pendente",
  dataEmplacamento: undefined,
};

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>;
  mode?: "create" | "edit";
  action: (data: unknown) => Promise<unknown>;
}

export function CustomerForm({
  initialData,
  mode = "create",
  action,
}: CustomerFormProps) {
  const [step, setStep] = useState<1 | 2>(mode === "edit" ? 2 : 1);
  const [isPending, startTransition] = useTransition();
  const [sidebarData, setSidebarData] = useState<{
    found: boolean;
    modelo?: string;
    cidade?: string;
    arrivalDate?: Date | null;
  }>({ found: false });

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      ...defaultValues,
      ...initialData,
    },
  });

  // Set sidebar data when editing
  useEffect(() => {
    if (mode === "edit" && initialData?.chassi) {
      setSidebarData({
        found: true,
        modelo: initialData.modelo || undefined,
        cidade: initialData.cidade || undefined,
        arrivalDate: initialData.dataChegada,
      });
    }
  }, [mode, initialData]);

  const handleSearchResult = (
    found: boolean,
    data?: { modelo: string; cidade: string; arrivalDate?: Date | null },
  ) => {
    setSidebarData({
      found,
      modelo: data?.modelo,
      cidade: data?.cidade,
      arrivalDate: data?.arrivalDate,
    });
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    form.setValue("chassi", "");
    form.setValue("modelo", "");
    form.setValue("cidade", "");
    form.setValue("motoChegou", false);
    form.setValue("cliente", "");
    form.setValue("vendedor", "");
    form.setValue("dataFaturamento", undefined);
    form.setValue("dataChegada", undefined);
    form.setValue("statusRegistro", "Pendente");
    form.setValue("dataEmplacamento", undefined);
    setSidebarData({ found: false });
  };

  const handleSubmit = (data: CustomerFormData) => {
    startTransition(async () => {
      await action(data);
    });
  };

  const watchedValues = form.watch();
  const isEditMode = mode === "edit";
  const showSidebar = isEditMode || step === 2;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <div className="flex-1">
        {!isEditMode && (
          <div className="mb-6 flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/20 text-primary"
              }`}
            >
              1
            </div>
            <div
              className={`h-0.5 w-8 ${
                step === 2 ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
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
            {!isEditMode && step === 1 && (
              <ChassisStep form={form} onSearchResult={handleSearchResult} />
            )}

            {(isEditMode || step === 2) && (
              <CustomerDataStep
                form={form}
                onBack={!isEditMode ? handleBack : undefined}
              />
            )}
          </form>
        </Form>
      </div>

      {showSidebar && (
        <SidebarResumo
          chassi={watchedValues.chassi}
          found={sidebarData.found}
          modelo={watchedValues.modelo || sidebarData.modelo}
          cidade={watchedValues.cidade || sidebarData.cidade}
          cliente={watchedValues.cliente}
          vendedor={watchedValues.vendedor}
          statusRegistro={watchedValues.statusRegistro}
          motoChegou={watchedValues.motoChegou}
          arrivalDate={sidebarData.arrivalDate}
        />
      )}
    </div>
  );
}
