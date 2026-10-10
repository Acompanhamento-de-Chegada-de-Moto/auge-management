"use client";

import { ClipboardList } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CustomerFormData } from "@/validators/customer-schema";
import { SectionHeader } from "../../_components/section-header";
import { DatePickerField } from "./date-picker-field";

interface RegistrationSectionProps {
  form: UseFormReturn<CustomerFormData>;
  motorcycleFound: boolean;
}

export function RegistrationSection({
  form,
  motorcycleFound,
}: RegistrationSectionProps) {
  const registrationStatus = form.watch("registrationStatus");

  return (
    <section className="min-w-0 pb-2">
      <SectionHeader
        icon={ClipboardList}
        title="Datas e emplacamento"
        description="Informações complementares do pedido."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <DatePickerField
          control={form.control}
          name="billingDate"
          label="Data de Faturamento"
          optional
        />

        <DatePickerField
          control={form.control}
          name="forecastDate"
          label="Previsão de Chegada"
          optional
          disabled={motorcycleFound}
        />

        <FormField
          control={form.control}
          name="arrivalStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Recebimento físico
                <span className="ml-0.5 text-destructive" aria-hidden="true">
                  *
                </span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Sem Informação">
                    Ainda não recebida
                  </SelectItem>
                  <SelectItem value="Chegou">Confirmar que chegou</SelectItem>
                  {field.value === "Atrasada" && (
                    <SelectItem value="Atrasada" disabled>
                      Atrasada · calculado automaticamente
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
              <p className="text-xs text-base-content/60">
                O atraso é automático. Uma chegada confirmada não é desfeita
                pela edição.
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="registrationStatus"
          render={({ field }) => (
            <FormItem
              className={
                registrationStatus === "Sem Emplacamento"
                  ? "sm:col-span-2"
                  : undefined
              }
            >
              <FormLabel>
                Status de Emplacamento
                <span className="ml-0.5 text-destructive" aria-hidden="true">
                  *
                </span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Sem Emplacamento">
                    Sem Emplacamento
                  </SelectItem>
                  <SelectItem value="Emplacando">Emplacando</SelectItem>
                  <SelectItem value="Emplacado">Emplacado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {registrationStatus !== "Sem Emplacamento" && (
          <DatePickerField
            control={form.control}
            name="registrationDate"
            label="Data de Emplacamento"
          />
        )}
      </div>
    </section>
  );
}
