"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import {
  customerSchema,
  type CustomerFormData,
} from "@/validators/customer-schema";
import { ChassisStep } from "./chassis-step";
import { CustomerDataStep } from "./customer-data-step";

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
  dataRegistro: undefined,
};

export function CustomerDialog({ open, onOpenChange }: CustomerDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues,
  });

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = (data: CustomerFormData) => {
    console.log("Formulário enviado:", data);
    onOpenChange(false);
    form.reset(defaultValues);
    setStep(1);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      form.reset(defaultValues);
      setStep(1);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cadastro de Cliente</DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Consulte o chassi da motocicleta na logística."
              : "Preencha os dados do cliente."}
          </DialogDescription>
        </DialogHeader>

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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {step === 1 && <ChassisStep form={form} onNext={handleNext} />}

            {step === 2 && <CustomerDataStep form={form} onBack={handleBack} />}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
