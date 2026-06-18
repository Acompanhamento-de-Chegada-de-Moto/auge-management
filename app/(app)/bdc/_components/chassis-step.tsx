"use client";

import { SearchIcon } from "lucide-react";
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
import type { CustomerFormData } from "@/validators/customer-schema";

interface ChassisStepProps {
  form: UseFormReturn<CustomerFormData>;
  searchChassisAction: (chassis: string) => Promise<any>;
  onSearchResult: (
    found: boolean,
    data?: { model: string; forecastDate?: Date | null },
  ) => void;
}

export function ChassisStep({
  form,
  onSearchResult,
  searchChassisAction,
}: ChassisStepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    const chassisValue = form.getValues("chassis");

    if (!chassisValue || chassisValue.trim() === "") {
      setError("Digite um chassi para consultar.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const motorcycle = await searchChassisAction(chassisValue);

      if (motorcycle) {
        // Alimenta o formulário central com o que veio do banco
        form.setValue("model", motorcycle.model);
        form.setValue(
          "forecastDate",
          motorcycle.forecastDate
            ? new Date(motorcycle.forecastDate)
            : undefined,
        );

        // Limpa erros prévios de validação do chassi se existirem
        form.clearErrors("chassis");

        onSearchResult(true, {
          model: motorcycle.model,
          forecastDate: motorcycle.forecastDate,
        });
      } else {
        setError("Chassi não encontrado na base de dados de motocicletas.");
        onSearchResult(false);
      }
    } catch (err) {
      setError("Erro ao consultar chassi. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="chassis"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Chassi</FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input
                  placeholder="Digite o número do chassi"
                  {...field}
                  onChange={(e) => {
                    setError(null);
                    field.onChange(e.target.value.toUpperCase()); // Força o padrão uppercase
                  }}
                />
              </FormControl>
              <Button
                type="button"
                onClick={handleSearch}
                disabled={loading}
                className="shrink-0"
              >
                <SearchIcon className="mr-2 size-4" />
                {loading ? "Consultando..." : "Consultar"}
              </Button>
            </div>
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
