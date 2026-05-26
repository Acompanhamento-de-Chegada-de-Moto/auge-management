"use client";

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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { CustomerFormData } from "@/validators/customer-schema";

interface CustomerDataStepProps {
  form: UseFormReturn<CustomerFormData>;
  onBack?: () => void;
}

export function CustomerDataStep({ form, onBack }: CustomerDataStepProps) {
  const hasArrived = form.watch("hasArrived");
  const [registrationStatus, setRegistrationStatus] = useState(
    form.getValues("registrationStatus") || "Pendente",
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
        name="hasArrived"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>Moto chegou na loja?</FormLabel>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="arrivalDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Data de Chegada</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                    disabled={!hasArrived}
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
                  disabled={!hasArrived}
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
                const status = value as "Pendente" | "Em Emplacamento" | "Emplacado";
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
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Em Emplacamento">
                  Em Emplacamento
                </SelectItem>
                <SelectItem value="Emplacado">Emplacado</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {registrationStatus !== "Pendente" && (
        <FormField
          control={form.control}
          name="plateDate"
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
        <Button type="submit">Salvar</Button>
      </div>
    </div>
  );
}
