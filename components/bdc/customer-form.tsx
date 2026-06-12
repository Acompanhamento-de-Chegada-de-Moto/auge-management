"use client";

import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
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
  plateDate: undefined,
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
  const queryClient = useQueryClient();
  const router = useRouter();
  const [sidebarData, setSidebarData] = useState<{
    found: boolean;
    model?: string;
    city?: string;
    forecastDate?: Date | null;
  }>({ found: false });

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      ...defaultValues,
      ...initialData,
    },
  });

  useEffect(() => {
    if (mode === "edit" && initialData?.chassis) {
      setSidebarData({
        found: true,
        model: initialData.model || undefined,
        city: initialData.city || undefined,
        forecastDate: initialData.forecastDate,
      });
    }
  }, [mode, initialData]);

  const handleSearchResult = (
    found: boolean,
    data?: { model: string; city: string; forecastDate?: Date | null },
  ) => {
    setSidebarData({
      found,
      model: data?.model,
      city: data?.city,
      forecastDate: data?.forecastDate,
    });
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    form.setValue("chassis", "");
    form.setValue("cpf", "");
    form.setValue("model", "");
    form.setValue("city", "");
    form.setValue("customerName", "");
    form.setValue("sellerName", "");
    form.setValue("billingDate", undefined);
    form.setValue("forecastDate", undefined);
    form.setValue("registrationStatus", "Sem Emplacamento");
    form.setValue("plateDate", undefined);
    setSidebarData({ found: false });
  };

  const handleSubmit = (data: CustomerFormData) => {
    startTransition(async () => {
      const result = await action(data);
      if (result && typeof result === "object" && "success" in result && result.success) {
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        router.push("/bdc");
      }
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
                isPending={isPending}
              />
            )}
          </form>
        </Form>
      </div>

      {showSidebar && (
        <SidebarSummary
          chassis={watchedValues.chassis}
          found={sidebarData.found}
          model={watchedValues.model || sidebarData.model}
          city={watchedValues.city || sidebarData.city}
          customerName={watchedValues.customerName}
          sellerName={watchedValues.sellerName}
          registrationStatus={watchedValues.registrationStatus}
          forecastDate={sidebarData.forecastDate}
        />
      )}
    </div>
  );
}
