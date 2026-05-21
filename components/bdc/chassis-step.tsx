"use client";

import { Loader2Icon, ScanBarcodeIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { searchChassisAction } from "@/app/(app)/bdc/actions";
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
  onSearchResult: (
    found: boolean,
    data?: { modelo: string; cidade: string; arrivalDate?: Date | null },
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

    try {
      const moto = await searchChassisAction(chassiValue);

      if (moto) {
        form.setValue("modelo", moto.model);
        form.setValue("cidade", "—"); // cidade vem do cliente, não da moto
        form.setValue("motoChegou", !!moto.arrivalDate);
        if (moto.arrivalDate) {
          form.setValue("dataChegada", moto.arrivalDate);
        }
        onSearchResult(true, {
          modelo: moto.model,
          cidade: "",
          arrivalDate: moto.arrivalDate,
        });
      } else {
        form.setValue("modelo", "");
        form.setValue("cidade", "");
        form.setValue("motoChegou", false);
        onSearchResult(false);
      }
    } catch {
      form.setValue("modelo", "");
      form.setValue("cidade", "");
      form.setValue("motoChegou", false);
      onSearchResult(false);
    }

    setIsSearching(false);
  };

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ScanBarcodeIcon className="size-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Consultar Chassi</h2>
        <p className="text-sm text-muted-foreground">
          Digite o número do chassi para consultar na logística.
        </p>
      </div>

      <FormField
        control={form.control}
        name="chassi"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="sr-only">Chassi</FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input
                  placeholder="Ex: 9BWHE21JX24060961"
                  {...field}
                  className="h-11"
                />
              </FormControl>
              <Button
                type="button"
                onClick={handleSearch}
                disabled={isSearching}
                className="h-11 shrink-0"
              >
                {isSearching ? (
                  <span className="animate-spin">
                    <Loader2Icon className="size-4" />
                  </span>
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
