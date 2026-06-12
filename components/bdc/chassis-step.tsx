"use client";

import { SearchIcon } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { searchChassisAction } from "@/app/(app)/bdc/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CustomerFormData } from "@/validators/customer-schema";

interface ChassisStepProps {
  form: UseFormReturn<CustomerFormData>;
  onSearchResult: (
    found: boolean,
    data?: { model: string; city: string; forecastDate?: Date | null },
  ) => void;
}

export function ChassisStep({ form, onSearchResult }: ChassisStepProps) {
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
        form.setValue("model", motorcycle.model);
        form.setValue("city", "");
        form.setValue("forecastDate", motorcycle.forecastDate ?? undefined);

        onSearchResult(true, {
          model: motorcycle.model,
          city: "",
          forecastDate: motorcycle.forecastDate,
        });
      } else {
        form.setValue("model", "");
        form.setValue("city", "");
        form.setValue("forecastDate", undefined);

        onSearchResult(false);
      }
    } catch {
      setError("Erro ao consultar chassi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="chassis">Chassi</Label>
        <div className="flex gap-2">
          <Input
            id="chassis"
            placeholder="Digite o número do chassi"
            {...form.register("chassis")}
          />
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
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
