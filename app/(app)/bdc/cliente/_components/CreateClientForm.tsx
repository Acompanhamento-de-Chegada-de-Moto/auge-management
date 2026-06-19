"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { SidebarSummary } from "@/app/(app)/bdc/_components/SidebarSummary";
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
import { cn } from "@/lib/utils";
import {
  type ClientSchemaType,
  clientSchema,
} from "@/lib/zod-schemas/client-schema";

interface ICreateCustomerFormProps {
  action: (
    data: ClientSchemaType,
  ) => Promise<{ status: string; message: string }>;
  searchChassisAction: (chassis: string) => Promise<any>;
}

export function CreateClientForm({
  action,
  searchChassisAction,
}: ICreateCustomerFormProps) {
  const [pending, startTransition] = useTransition();
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [motorcycleFound, setMotorcycleFound] = useState(false);

  const router = useRouter();

  const form = useForm<ClientSchemaType>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      customerName: "",
      cpf: "",
      sellerName: "",
      city: "",
      model: "",
      chassis: "",
      billingDate: undefined,
      forecastDate: undefined,
      registrationStatus: "Sem Emplacamento",
      registrationDate: undefined,
    },
  });

  const watchedValues = form.watch();

  const handleBlurOrSearchChassis = async () => {
    const chassisValue = form.getValues("chassis");
    if (!chassisValue || chassisValue.trim() === "") return;

    setSearchLoading(true);
    setSearchError(null);

    try {
      const motorcycle = await searchChassisAction(chassisValue);

      if (motorcycle) {
        form.setValue("model", motorcycle.model);
        form.setValue("city", motorcycle.city || "");
        form.setValue(
          "forecastDate",
          motorcycle.forecastArrival
            ? new Date(motorcycle.forecastArrival)
            : undefined,
        );
        setMotorcycleFound(true);
      } else {
        // Moto não encontrada no estoque: avança permitindo criação manual de ambos
        setMotorcycleFound(false);
      }
    } catch {
      setSearchError("Erro ao validar chassi no estoque.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubmit = (data: ClientSchemaType) => {
    startTransition(async () => {
      const result = await action(data);

      if (!result || typeof result !== "object") {
        toast.error("Ocorreu um erro inesperado.");
        return;
      }

      if (result && result.status === "success") {
        toast.success(
          "message" in result
            ? String(result.message)
            : "Operação realizada com sucesso!",
        );

        router.push("/bdc");
      } else {
        toast.error(
          "message" in result
            ? String(result.message)
            : "Não foi possível concluir a operação.",
        );
        setSearchError(result?.message || "Erro desconhecido ao salvar.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <div className="flex-1">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Chassi - Principal gatilho para a regra de negócio */}
            <FormField
              control={form.control}
              name="chassis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chassi</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="Número do chassi"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleBlurOrSearchChassis}
                      disabled={searchLoading}
                      className="shrink-0"
                    >
                      <SearchIcon className="size-4 mr-1" />
                      {searchLoading ? "Buscando..." : "Checar Estoque"}
                    </Button>
                  </div>
                  {searchError && (
                    <p className="text-xs font-medium text-destructive">
                      {searchError}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Aviso dinâmico de nova moto */}
            {watchedValues.chassis && !searchLoading && !motorcycleFound && (
              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
                ℹ️ Esta moto não está no estoque. O modelo e a previsão
                informados abaixo criarão um registro de previsão
                automaticamente.
              </div>
            )}

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
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Cidade" {...field} />
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
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Modelo da motocicleta"
                      {...field}
                      readOnly={motorcycleFound}
                    />
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
                          disabled={motorcycleFound}
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

            <div className="flex gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Salvando..." : "Salvar Cliente"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <SidebarSummary
        chassis={watchedValues.chassis}
        found={motorcycleFound}
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
