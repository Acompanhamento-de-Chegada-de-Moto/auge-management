"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { SearchIcon } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { CustomerFormData } from "@/validators/customer-schema";

const motosMock = [
  {
    chassi: "9BWHE21JX24060961",
    modelo: "Honda Civic EXL",
    cidade: "São Paulo",
  },
  {
    chassi: "3VWFE21C4YM543210",
    modelo: "Toyota Corolla XEI",
    cidade: "Rio de Janeiro",
  },
  {
    chassi: "1FTFW1EF7EKG12345",
    modelo: "Jeep Compass Limited",
    cidade: "Belo Horizonte",
  },
  {
    chassi: "5NPEB4AC8BH123456",
    modelo: "Hyundai Creta Platinum",
    cidade: "Curitiba",
  },
  {
    chassi: "WVGZZZ5NZAW123456",
    modelo: "Volkswagen T-Cross Highline",
    cidade: "Porto Alegre",
  },
  {
    chassi: "3GNDA13D76S123456",
    modelo: "Chevrolet Tracker Premier",
    cidade: "Salvador",
  },
  {
    chassi: "WBA3B1C51DF123456",
    modelo: "BMW 320i Sport",
    cidade: "São Paulo",
  },
  {
    chassi: "WDD1770431J123456",
    modelo: "Mercedes-Benz A200",
    cidade: "Campinas",
  },
  {
    chassi: "1FMCU0F60LUA12345",
    modelo: "Ford Bronco Wildtrak",
    cidade: "Brasília",
  },
  {
    chassi: "LGXCG4DG9N1234567",
    modelo: "BYD Dolphin Plus",
    cidade: "Florianópolis",
  },
];

interface ChassisStepProps {
  form: UseFormReturn<CustomerFormData>;
  onSearchResult: (
    found: boolean,
    data?: { modelo: string; cidade: string },
  ) => void;
}

export function ChassisStep({ form, onSearchResult }: ChassisStepProps) {
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    const chassiValue = form.getValues("chassi");
    if (!chassiValue) {
      form.setError("chassi", { message: "Digite o número do chassi" });
      return;
    }

    setIsSearching(true);

    // Simula delay de consulta
    await new Promise((resolve) => setTimeout(resolve, 800));

    const found = motosMock.find(
      (m) => m.chassi.toLowerCase() === chassiValue.toLowerCase(),
    );

    if (found) {
      // Se encontrado na logística, preenche os dados e marca como chegou
      form.setValue("modelo", found.modelo);
      form.setValue("cidade", found.cidade);
      form.setValue("motoChegou", true);
      onSearchResult(true, { modelo: found.modelo, cidade: found.cidade });
    } else {
      // Se não encontrado, limpa os campos para preenchimento manual
      form.setValue("modelo", "");
      form.setValue("cidade", "");
      form.setValue("motoChegou", false);
      onSearchResult(false);
    }

    setIsSearching(false);
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="chassi"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Chassi</FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input placeholder="Digite o número do chassi" {...field} />
              </FormControl>
              <Button
                type="button"
                onClick={handleSearch}
                disabled={isSearching}
                className="shrink-0"
              >
                {isSearching ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <>
                    <SearchIcon className="mr-1 size-4" />
                    Consultar
                  </>
                )}
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
