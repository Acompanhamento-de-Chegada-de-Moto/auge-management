"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useCallback, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  type MotorcycleFormData,
  motorcycleSchema,
} from "@/validators/motorcycle-schema";

interface MotorcycleEditFormProps {
  initialData: Partial<MotorcycleFormData>;
  action: (data: unknown) => Promise<unknown>;
}

export function MotorcycleEditForm({
  initialData,
  action,
}: MotorcycleEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<MotorcycleFormData>({
    resolver: zodResolver(motorcycleSchema),
    defaultValues: {
      chassis: "",
      model: "",
      forecastDate: undefined,
      ...initialData,
    },
  });

  const handleSubmit = useCallback(
    async (data: MotorcycleFormData) => {
      startTransition(async () => {
        const result = (await action(data)) as { success: boolean } | undefined;
        if (result?.success) {
          router.push("/estoque");
        }
      });
    },
    [action, router],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 max-w-xl"
      >
        <div className="space-y-2">
          <Label htmlFor="chassis">Chassi</Label>
          <Input
            id="chassis"
            placeholder="Ex: 9BWHE21JX24060961"
            {...form.register("chassis")}
          />
          {form.formState.errors.chassis && (
            <p className="text-sm text-red-500">
              {form.formState.errors.chassis.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Modelo</Label>
          <Input
            id="model"
            placeholder="Ex: Honda CG 160"
            {...form.register("model")}
          />
          {form.formState.errors.model && (
            <p className="text-sm text-red-500">
              {form.formState.errors.model.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="forecastDate">Previsão de Chegada</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !form.watch("forecastDate") && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 size-4" />
                {form.watch("forecastDate") ? (
                  format(form.watch("forecastDate") as Date, "dd/MM/yyyy", {
                    locale: ptBR,
                  })
                ) : (
                  <span>Selecione a previsão (opcional)</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={form.watch("forecastDate")}
                onSelect={(date) => form.setValue("forecastDate", date)}
              />
            </PopoverContent>
          </Popover>
          {form.formState.errors.forecastDate && (
            <p className="text-sm text-red-500">
              {form.formState.errors.forecastDate.message}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isPending} className="min-w-[120px]">
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
