"use client";

import { isBefore, startOfDay } from "date-fns";
import { ShieldCheck } from "lucide-react";
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
  const forecastDate = form.watch("forecastDate");
  const arrivalStatus = form.watch("arrivalStatus");
  const registrationStatus = form.watch("registrationStatus");

  const forecastHasPassed =
    forecastDate != null &&
    isBefore(startOfDay(forecastDate), startOfDay(new Date()));

  return (
    <section className="rounded-xl border bg-card p-4 sm:p-5 lg:p-6">
      <SectionHeader icon={ShieldCheck} title="Faturamento e Emplacamento" />

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
            <FormItem className="sm:col-span-2">
              <FormLabel>
                Status de Chegada
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
                  <SelectItem value="Sem Informação">Sem Informação</SelectItem>
                  <SelectItem value="Chegou">Chegou</SelectItem>
                  <SelectItem value="Atrasada">Atrasada</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {forecastHasPassed && arrivalStatus === "Sem Informação" && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-amber-200/60 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400 sm:col-span-2"
          >
            <span aria-hidden="true">⚠️</span>
            <span>
              A data prevista para chegada já passou. Confirme se a moto chegou
              ou está atrasada.
            </span>
          </div>
        )}

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
