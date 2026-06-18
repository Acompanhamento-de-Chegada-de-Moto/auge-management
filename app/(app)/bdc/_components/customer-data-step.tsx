"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CustomerFormData } from "@/validators/customer-schema";

interface CustomerDataStepProps {
  form: UseFormReturn<CustomerFormData>;
  onBack?: () => void;
  isPending?: boolean;
}

export function CustomerDataStep({
  form,
  onBack,
  isPending,
}: CustomerDataStepProps) {
  const [registrationStatus, setRegistrationStatus] = useState(
    form.getValues("registrationStatus") || "Sem Emplacamento",
  );

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="customerName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cliente</FormLabel>
            <FormControl>
              <Input placeholder="Nome do cliente" {...field} />
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
            <FormLabel>CPF</FormLabel>
            <FormControl>
              <Input
                placeholder="000.000.000-00"
                {...field}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
                  const formatted = raw.replace(
                    /(\d{3})(\d{3})(\d{3})(\d{0,2})/,
                    (_, a, b, c, d) => {
                      let result = `${a}.${b}.${c}`;
                      if (d) result += `-${d}`;
                      return result;
                    },
                  );
                  field.onChange(formatted);
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
            <FormLabel>Vendedor</FormLabel>
            <FormControl>
              <Input placeholder="Nome do vendedor" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cidade</FormLabel>
            <FormControl>
              <Input placeholder="Cidade do cliente" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="model"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Modelo</FormLabel>
            <FormControl>
              <Input placeholder="Modelo da motocicleta" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="chassis"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Chassi</FormLabel>
            <FormControl>
              <Input placeholder="Número do chassi" {...field} readOnly />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="billingDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Data de Faturamento</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    {field.value ? (
                      format(field.value, "dd/MM/yyyy")
                    ) : (
                      <span>Selecionar data</span>
                    )}
                    <CalendarIcon className="ml-auto size-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="forecastDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Previsão de Chegada</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    {field.value ? (
                      format(field.value, "dd/MM/yyyy")
                    ) : (
                      <span>Selecionar data</span>
                    )}
                    <CalendarIcon className="ml-auto size-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="registrationStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status de Emplacamento</FormLabel>
            <Select
              onValueChange={(value) => {
                const status = value as
                  | "Sem Emplacamento"
                  | "Emplacando"
                  | "Emplacado";
                field.onChange(status);
                setRegistrationStatus(status);
              }}
              defaultValue={field.value}
            >
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
        <FormField
          control={form.control}
                name="registrationDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Emplacamento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy")
                      ) : (
                        <span>Selecionar data</span>
                      )}
                      <CalendarIcon className="ml-auto size-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="flex gap-2">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack}>
            Voltar
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
}
