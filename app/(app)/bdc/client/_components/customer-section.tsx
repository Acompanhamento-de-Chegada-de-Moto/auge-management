"use client";

import { UserRound } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { maskCPFIncremental } from "@/lib/cpf";
import type { CustomerFormData } from "@/validators/customer-schema";
import { SectionHeader } from "../../_components/section-header";

interface CustomerSectionProps {
  form: UseFormReturn<CustomerFormData>;
}

export function CustomerSection({ form }: CustomerSectionProps) {
  return (
    <section className="min-w-0 border-b border-base-300/80 pb-6">
      <SectionHeader icon={UserRound} title="Dados do Cliente" />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>
                Cliente
                <span className="ml-0.5 text-destructive" aria-hidden="true">
                  *
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Nome completo do cliente"
                  autoComplete="name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                CPF
                <span className="ml-0.5 text-destructive" aria-hidden="true">
                  *
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  autoComplete="off"
                  onChange={(event) => {
                    field.onChange(maskCPFIncremental(event.target.value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sellerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Vendedor(a)
                <span className="ml-0.5 text-destructive" aria-hidden="true">
                  *
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Nome do vendedor responsável"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>
                Cidade
                <span className="ml-0.5 text-destructive" aria-hidden="true">
                  *
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Cidade"
                  autoComplete="address-level2"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
