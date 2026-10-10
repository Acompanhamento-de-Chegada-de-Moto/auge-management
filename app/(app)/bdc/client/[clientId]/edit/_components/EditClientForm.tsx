"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Bike,
  CheckCircle2,
  Info,
  Loader2,
  Plus,
  Save,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateClientAction } from "@/app/(app)/bdc/_actions/clients";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { searchMotorcycleByChassis } from "@/lib/api/client";
import { formatCPF } from "@/lib/cpf";
import type { getClientById } from "@/lib/data/client";
import { cn } from "@/lib/utils";
import {
  type CustomerFormData,
  customerSchema,
} from "@/validators/customer-schema";
import { SectionHeader } from "../../../../_components/section-header";
import { CustomerSection } from "../../../_components/customer-section";
import { DatePickerField } from "../../../_components/date-picker-field";
import { RegistrationSection } from "../../../_components/registration-section";

type Client = NonNullable<Awaited<ReturnType<typeof getClientById>>>;

interface EditClientFormProps {
  client: Client;
  selectedMotorcycle: Client["motorcycles"][number] | null;
}

export function EditClientForm({
  client,
  selectedMotorcycle,
}: EditClientFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showNewMotorcycle, setShowNewMotorcycle] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [motorcycleFound, setMotorcycleFound] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customerName: client.name ?? "",
      cpf: formatCPF(client.cpf ?? ""),
      sellerName: client.sellersName ?? "",
      city: client.city ?? "",
      model: selectedMotorcycle?.model ?? "",
      chassis: selectedMotorcycle?.chassi ?? "",
      billingDate: client.billingDate ?? undefined,
      forecastDate: selectedMotorcycle?.forecastArrival ?? undefined,
      registrationStatus:
        selectedMotorcycle?.registrationStatus === "PLATED"
          ? "Emplacado"
          : selectedMotorcycle?.registrationStatus === "PLATING"
            ? "Emplacando"
            : "Sem Emplacamento",
      registrationDate: selectedMotorcycle?.registrationDate ?? undefined,
      arrivalStatus:
        selectedMotorcycle?.forecastArrivalStatus === "ARRIVED"
          ? "Chegou"
          : selectedMotorcycle?.forecastArrivalStatus === "DELAYED"
            ? "Atrasada"
            : "Sem Informação",
      newChassis: "",
      newModel: "",
      newForecastDate: undefined,
    },
  });

  const watchedValues = form.watch();
  const hasExistingMotorcycle = !!selectedMotorcycle;

  const handleBlurOrSearchChassis = async () => {
    const chassisValue = form.getValues("chassis");
    if (!chassisValue || chassisValue.trim() === "") return;

    setSearchLoading(true);
    setSearchError(null);

    try {
      const motorcycle = await searchMotorcycleByChassis<{
        model: string;
        forecastArrival: string | null;
        forecastArrivalStatus: string | null;
      }>(chassisValue);
      setHasSearched(true);

      if (motorcycle) {
        form.setValue("model", motorcycle.model);
        form.setValue(
          "forecastDate",
          motorcycle.forecastArrival
            ? new Date(motorcycle.forecastArrival)
            : undefined,
        );
        if (
          motorcycle.forecastArrivalStatus &&
          motorcycle.forecastArrivalStatus !== "NO_INFORMATION"
        ) {
          form.setValue(
            "arrivalStatus",
            motorcycle.forecastArrivalStatus === "ARRIVED"
              ? "Chegou"
              : "Atrasada",
          );
        }
        setMotorcycleFound(true);
      } else {
        setMotorcycleFound(false);
      }
    } catch {
      setSearchError("Erro ao validar chassi no estoque.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubmit = async (formData: CustomerFormData) => {
    startTransition(async () => {
      const result = await updateClientAction(client.id, {
        motorcycleId: selectedMotorcycle?.id ?? null,
        values: formData,
      });

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.push("/bdc");
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-5"
          aria-busy={pending}
        >
          <div className="space-y-6">
            <CustomerSection form={form} />

            <section className="min-w-0 border-b border-base-300/80 pb-6">
              <SectionHeader
                icon={Bike}
                title="Motocicleta"
                description={
                  hasExistingMotorcycle
                    ? "Chassi localizado no estoque"
                    : "Informe o chassi para localizar no estoque"
                }
              />

              <FormField
                control={form.control}
                name="chassis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chassi</FormLabel>
                    {hasExistingMotorcycle ? (
                      <FormControl>
                        <Input
                          placeholder="Número do chassi"
                          className="font-mono uppercase bg-muted text-muted-foreground"
                          {...field}
                          readOnly
                        />
                      </FormControl>
                    ) : (
                      <div className="flex gap-2">
                        <FormControl>
                          <div className="relative flex-1">
                            <Input
                              placeholder="Número do chassi"
                              className={cn(
                                "font-mono uppercase pr-9",
                                hasSearched &&
                                  motorcycleFound &&
                                  "border-green-500 focus-visible:ring-green-500/30",
                              )}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e.target.value.toUpperCase());
                                setHasSearched(false);
                                setMotorcycleFound(false);
                              }}
                            />
                            {hasSearched && motorcycleFound && (
                              <CheckCircle2 className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-green-600 dark:text-green-400" />
                            )}
                          </div>
                        </FormControl>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleBlurOrSearchChassis}
                          disabled={searchLoading}
                          className="shrink-0 min-w-[136px]"
                        >
                          {searchLoading ? (
                            <Loader2 className="size-4 mr-1.5 animate-spin" />
                          ) : (
                            <SearchIcon className="size-4 mr-1.5" />
                          )}
                          {searchLoading ? "Buscando..." : "Checar Estoque"}
                        </Button>
                      </div>
                    )}
                    {searchError && (
                      <p className="text-xs font-medium text-destructive">
                        {searchError}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {hasSearched && motorcycleFound && (
                <div
                  aria-live="polite"
                  className="mt-3 flex items-start gap-2 rounded-lg border border-green-200/60 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-400"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                  <span>
                    Moto localizada no estoque. Modelo, cidade e previsão
                    preenchidos automaticamente.
                  </span>
                </div>
              )}

              {watchedValues.chassis &&
                !searchLoading &&
                !motorcycleFound &&
                !hasExistingMotorcycle && (
                  <div
                    aria-live="polite"
                    className="mt-3 flex items-start gap-2 rounded-lg border border-blue-200/60 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-400"
                  >
                    <Info
                      className="mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span>
                      Esta moto não está no estoque. O modelo e a previsão
                      informados abaixo criarão um registro de previsão
                      automaticamente.
                    </span>
                  </div>
                )}

              <div className="mt-4">
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
                          className={cn(
                            motorcycleFound && "bg-muted text-muted-foreground",
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>
          </div>

          <RegistrationSection form={form} motorcycleFound={motorcycleFound} />

          <section className="min-w-0 border-b border-base-300/80 pb-6">
            <SectionHeader
              icon={Bike}
              title="Outra motocicleta"
              description="Opcional: adicione outra motocicleta ao cadastro deste cliente."
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowNewMotorcycle(!showNewMotorcycle)}
              className="w-full"
            >
              <Plus className="size-4 mr-2" />
              {showNewMotorcycle ? "Cancelar" : "Adicionar Outra Motocicleta"}
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
                        <Input placeholder="Modelo da motocicleta" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DatePickerField
                  control={form.control}
                  name="newForecastDate"
                  label="Previsão de Chegada"
                  optional
                />
              </div>
            )}
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-base-300/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-base-content/60">
              Os campos marcados com * são obrigatórios.
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button variant="outline" asChild disabled={pending}>
                <Link href="/bdc">
                  <ArrowLeft className="mr-2 size-4" aria-hidden="true" />
                  Cancelar
                </Link>
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <Loader2
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Save className="mr-2 size-4" aria-hidden="true" />
                )}
                {pending ? "Salvando…" : "Salvar alterações"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
