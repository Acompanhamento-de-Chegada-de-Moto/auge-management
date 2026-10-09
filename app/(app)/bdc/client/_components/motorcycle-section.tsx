"use client";

import { Bike, CheckCircle2, Loader2, Search, XCircle } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { searchMotorcycleByChassis } from "@/lib/api/client";
import type { CustomerFormData } from "@/validators/customer-schema";
import { SectionHeader } from "../../_components/section-header";
import type { MotorcycleLookupResult, MotorcycleLookupState } from "./types";

interface MotorcycleSectionProps {
  form: UseFormReturn<CustomerFormData>;
  onLookupResult: (state: MotorcycleLookupState) => void;
}

const arrivalStatusMap: Record<string, CustomerFormData["arrivalStatus"]> = {
  ARRIVED: "Chegou",
  DELAYED: "Atrasada",
  NO_INFORMATION: "Sem Informação",
};

export function MotorcycleSection({
  form,
  onLookupResult,
}: MotorcycleSectionProps) {
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [motorcycleFound, setMotorcycleFound] = useState(false);

  const chassis = form.watch("chassis");

  function clearSearchState() {
    setHasSearched(false);
    setMotorcycleFound(false);
    setSearchError(null);
    onLookupResult({ searched: false, motorcycle: null });
  }

  function fillMotorcycleFields(motorcycle: MotorcycleLookupResult) {
    form.setValue("model", motorcycle.model, {
      shouldDirty: true,
      shouldValidate: true,
    });

    form.setValue(
      "forecastDate",
      motorcycle.forecastArrival
        ? new Date(motorcycle.forecastArrival)
        : undefined,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );

    const arrivalStatus = motorcycle.forecastArrivalStatus
      ? arrivalStatusMap[motorcycle.forecastArrivalStatus]
      : undefined;

    if (arrivalStatus) {
      form.setValue("arrivalStatus", arrivalStatus, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }

  async function handleSearch() {
    const normalizedChassis = form.getValues("chassis").trim().toUpperCase();

    if (!normalizedChassis || searchLoading) {
      return;
    }

    form.setValue("chassis", normalizedChassis, {
      shouldValidate: true,
    });

    setSearchLoading(true);
    setSearchError(null);
    setHasSearched(false);
    setMotorcycleFound(false);
    onLookupResult({ searched: false, motorcycle: null });

    try {
      const motorcycle =
        await searchMotorcycleByChassis<MotorcycleLookupResult>(
          normalizedChassis,
        );

      setHasSearched(true);
      setMotorcycleFound(Boolean(motorcycle));
      onLookupResult({ searched: true, motorcycle });

      if (motorcycle) {
        fillMotorcycleFields(motorcycle);
      }
    } catch {
      setSearchError("Erro ao consultar o chassi no estoque.");
    } finally {
      setSearchLoading(false);
    }
  }

  return (
    <section className="min-w-0 rounded-xl border bg-card p-4 sm:p-5 lg:p-6">
      <SectionHeader
        icon={Bike}
        title="Motocicleta"
        description="Informe o chassi para localizar a motocicleta no estoque."
      />

      <div className="mt-5 space-y-4">
        <FormField
          control={form.control}
          name="chassis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Chassi
                <span className="ml-0.5 text-destructive" aria-hidden="true">
                  *
                </span>
              </FormLabel>

              <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                <FormControl>
                  <div className="relative min-w-0 flex-1">
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Digite o número do chassi"
                      autoComplete="off"
                      className={cn(
                        "pr-9 font-mono uppercase",
                        hasSearched &&
                          motorcycleFound &&
                          "border-green-600 focus-visible:ring-green-600/30",
                      )}
                      onChange={(event) => {
                        field.onChange(event.target.value.toUpperCase());
                        clearSearchState();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void handleSearch();
                        }
                      }}
                    />

                    {hasSearched && motorcycleFound && (
                      <CheckCircle2
                        aria-label="Chassi encontrado"
                        className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-green-600"
                      />
                    )}
                  </div>
                </FormControl>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void handleSearch()}
                  disabled={searchLoading || !chassis?.trim()}
                  className="w-full shrink-0 sm:w-auto sm:min-w-[148px]"
                >
                  {searchLoading ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 size-4" />
                  )}

                  {searchLoading ? "Buscando..." : "Consultar estoque"}
                </Button>
              </div>

              {searchError && (
                <p role="alert" className="text-sm text-destructive">
                  {searchError}
                </p>
              )}

              <FormMessage />
            </FormItem>
          )}
        />

        {hasSearched && motorcycleFound && (
          <output className="flex items-start gap-2 rounded-lg border border-green-200/60 bg-green-50 p-3 text-sm dark:border-green-900/40 dark:bg-green-950/30">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />

            <div className="min-w-0 space-y-0.5">
              <p className="font-medium text-green-800 dark:text-green-400">
                Motocicleta localizada no estoque.
              </p>
              <p className="text-green-700/90 dark:text-green-500/90">
                Os dados disponíveis foram preenchidos automaticamente.
              </p>
            </div>
          </output>
        )}

        {hasSearched && !motorcycleFound && !searchError && (
          <output className="flex items-start gap-2 rounded-lg border border-blue-200/60 bg-blue-50 p-3 text-sm dark:border-blue-900/40 dark:bg-blue-950/30">
            <XCircle className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />

            <div className="min-w-0 space-y-0.5">
              <p className="font-medium text-blue-800 dark:text-blue-400">
                Motocicleta não encontrada no estoque.
              </p>
              <p className="text-blue-700/90 dark:text-blue-500/90">
                Preencha o modelo manualmente para continuar.
              </p>
            </div>
          </output>
        )}

        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Modelo
                <span className="ml-0.5 text-destructive" aria-hidden="true">
                  *
                </span>
              </FormLabel>

              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Modelo da motocicleta"
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
  );
}
