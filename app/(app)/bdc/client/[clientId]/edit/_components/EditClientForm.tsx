"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import dayjs from "dayjs";
import {
  Bike,
  CalendarIcon,
  Loader2,
  Plus,
  ShieldCheck,
  User,
} from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { SidebarSummary } from "@/app/(app)/bdc/_components/SidebarSummary";
import { SectionHeader } from "@/components/bdc/section-header";
import { EditClientAction } from "@/app/(app)/bdc/actions";
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
import type { getClientById } from "@/lib/data/client";

type Client = NonNullable<Awaited<ReturnType<typeof getClientById>>>;

interface EditClientFormProps {
  client: Client;
}

export function EditClientForm({ client }: EditClientFormProps) {
  const [pending, startTransition] = useTransition();
  const [showNewMotorcycle, setShowNewMotorcycle] = useState(false);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customerName: client.name ?? "",
      cpf: formatCPF(client.cpf ?? ""),
      sellerName: client.sellersName ?? "",
      city: client.city ?? "",
      model: client.motorcycles[0]?.model ?? "",
      chassis: client.motorcycles[0]?.chassi ?? "",
      billingDate: client.billingDate ?? undefined,
      forecastDate: client.motorcycles[0]?.forecastArrival ?? undefined,
      registrationStatus:
        client.motorcycles[0]?.registrationStatus === "PLATED"
          ? "Emplacado"
          : client.motorcycles[0]?.registrationStatus === "PLATING"
            ? "Emplacando"
            : "Sem Emplacamento",
      registrationDate: client.motorcycles[0]?.registrationDate ?? undefined,
      arrivalStatus:
        client.motorcycles[0]?.forecastArrivalStatus === "ARRIVED"
          ? "Chegou"
          : client.motorcycles[0]?.forecastArrivalStatus === "DELAYED"
            ? "Atrasada"
            : "Sem Informação",
      newChassis: "",
      newModel: "",
      newForecastDate: undefined,
    },
  });

  const watchedValues = form.watch();

  const handleSubmit = async (formData: CustomerFormData) => {
    startTransition(async () => {
      const result = await EditClientAction(client.id, formData);

      if (result.status === "error") {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <div className="flex-1">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <section className="rounded-xl border bg-card p-6 shadow-sm">
              <SectionHeader
                icon={Bike}
                title="Motocicleta"
                description="Chassi localizado no estoque"
              />

              <FormField
                control={form.control}
                name="chassis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chassi</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Número do chassi"
                        className="font-mono uppercase bg-muted text-muted-foreground"
                        {...field}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-4">
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
              </div>
            </section>

            <section className="rounded-xl border bg-card p-6 shadow-sm">
              <SectionHeader icon={User} title="Dados do Cliente" />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
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
                          inputMode="numeric"
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
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <section className="rounded-xl border bg-card p-6 shadow-sm">
              <SectionHeader
                icon={ShieldCheck}
                title="Faturamento e Emplacamento"
              />

              <div className="grid gap-4 sm:grid-cols-2">
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
                  name="arrivalStatus"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Status de Chegada</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Sem Informação">
                            Sem Informação
                          </SelectItem>
                          <SelectItem value="Chegou">Chegou</SelectItem>
                          <SelectItem value="Atrasada">Atrasada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedValues.forecastDate &&
                  dayjs(watchedValues.forecastDate).startOf("day").isBefore(dayjs().startOf("day")) &&
                  watchedValues.arrivalStatus === "Sem Informação" && (
                    <div
                      role="alert"
                      className="sm:col-span-2 flex items-start gap-2 rounded-lg border border-amber-200/60 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400"
                    >
                      <span aria-hidden className="mt-0.5">⚠️</span>
                      <span>
                        A data prevista para chegada já passou. Confirme se a moto
                        chegou ou está atrasada.
                      </span>
                    </div>
                  )}

                <FormField
                  control={form.control}
                  name="registrationStatus"
                  render={({ field }) => (
                    <FormItem
                      className={cn(
                        watchedValues.registrationStatus ===
                          "Sem Emplacamento" && "sm:col-span-2",
                      )}
                    >
                      <FormLabel>Status de Emplacamento</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
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
              </div>
            </section>

            <section className="rounded-xl border bg-card p-6 shadow-sm">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewMotorcycle(!showNewMotorcycle)}
                className="w-full"
              >
                <Plus className="size-4 mr-2" />
                {showNewMotorcycle
                  ? "Cancelar"
                  : "Adicionar Outra Motocicleta"}
              </Button>

              {showNewMotorcycle && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 animated-in fade-in slide-in-from-top-2 duration-200">
                  <FormField
                    control={form.control}
                    name="newChassis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chassi (nova moto)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Número do chassi"
                            className="font-mono uppercase"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo (nova moto)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Modelo da motocicleta"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newForecastDate"
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
                          <PopoverContent
                            className="w-auto p-0"
                            align="start"
                          >
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
                </div>
              )}
            </section>

            <div className="sticky bottom-0 -mx-1 bg-gradient-to-t from-background via-background to-transparent px-1 pt-4 pb-1">
              <Button
                type="submit"
                disabled={pending}
                size="lg"
                className="w-full sm:w-auto sm:min-w-[200px]"
              >
                {pending && <Loader2 className="size-4 mr-2 animate-spin" />}
                {pending ? "Salvando..." : "Salvar Alterações"}
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
        arrivalStatus={watchedValues.arrivalStatus}
      />
    </div>
  );
}
