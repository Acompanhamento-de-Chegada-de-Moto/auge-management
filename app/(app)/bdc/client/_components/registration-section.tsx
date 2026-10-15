"use client";

import { ClipboardList } from "lucide-react";
import { type UseFormReturn, useWatch } from "react-hook-form";
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
  const registrationStatus = useWatch({
    control: form.control,
    name: "registrationStatus",
  });

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
              <FormControl>
                <select
                  {...field}
                  className="select h-11 w-full"
                  onChange={(event) => {
                    field.onChange(event);
                    if (event.currentTarget.value === "Sem Emplacamento") {
                      form.setValue("registrationDate", undefined, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }}
                >
                  <option value="Sem Emplacamento">Sem Emplacamento</option>
                  <option value="Emplacando">Emplacando</option>
                  <option value="Emplacado">Emplacado</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {registrationStatus !== "Sem Emplacamento" && (
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="registrationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Emplacamento *</FormLabel>
                  <FormControl>
                    <input
                      type="date"
                      lang="pt-BR"
                      className="input h-11 w-full"
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value?.toISOString().slice(0, 10) ?? ""}
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        field.onChange(
                          value
                            ? new Date(`${value}T12:00:00.000Z`)
                            : undefined,
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-xs text-base-content/65">
              Informe a data para salvar o status{" "}
              {registrationStatus.toLowerCase()}.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
