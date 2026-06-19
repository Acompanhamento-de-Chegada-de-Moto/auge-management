"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { SidebarSummary } from "@/app/(app)/bdc/_components/SidebarSummary";
import type { UserGetClientType } from "@/app/data/user/user-get-client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
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
import { formatCPF } from "@/lib/cpf";
import { cn } from "@/lib/utils";
import {
  type CustomerFormData,
  customerSchema,
} from "@/validators/customer-schema";

interface ICustomerFormProps {
  data: UserGetClientType;
  clientId: string;
}

export function EditClientForm({ data, clientId }: ICustomerFormProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customerName: data?.name ?? "",
      cpf: formatCPF(data?.cpf ?? ""),
      sellerName: data?.sellersName ?? "",
      city: data?.city ?? "",
      model: data?.motorcycles[0]?.model ?? "",
      chassis: data?.motorcycles[0]?.chassi ?? "",
      forecastDate: data?.motorcycles[0]?.forecastArrival ?? undefined,
    },
  });

  const watchedValues = form.watch();

  const handleSubmit = () => {};

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <div className="flex-1">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
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
                        const raw = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 11);
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
                  <FormLabel>Vendedor (a)</FormLabel>
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
                      // setRegistrationStatus(status);
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

            {watchedValues.registrationStatus !== "Sem Emplacamento" && (
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
              <Button type="submit" disabled={pending}>
                {pending ? "Editando Cliente..." : "Editar Cliente"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <SidebarSummary
        chassis={watchedValues.chassis}
        found
        model={watchedValues.model}
        city={watchedValues.city}
        customerName={watchedValues.customerName}
        sellerName={watchedValues.sellerName}
        registrationStatus={watchedValues.registrationStatus}
        forecastDate={watchedValues.forecastDate}
      />
    </div>
  );
}
