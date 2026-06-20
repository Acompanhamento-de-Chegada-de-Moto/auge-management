"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bike, CalendarIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
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
import { cn } from "@/lib/utils";

import {
  type CreateMotorcycleType,
  createMotorcycleSchema,
} from "@/lib/zod-schemas/motorcycle-schema";
import { CreateMotorcycleAction } from "../new/actions";

export function CreateMotorcycleForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(createMotorcycleSchema),
    defaultValues: {
      chassi: "",
      model: "",
      forecastArrival: undefined,
      forecastArrivalStatus: "NO_INFORMATION",
    },
  });

  const handleSubmit = useCallback(
    async (data: CreateMotorcycleType) => {
      startTransition(async () => {
        const result = await CreateMotorcycleAction(data);

        if (result.status === "success") {
          router.push("/inventory");
        } else {
          form.setError("chassi", {
            type: "manual",
            message: result.message,
          });
        }
      });
    },
    [router, form],
  );

  return (
    <div className="max-w-xl rounded-xl border bg-card p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bike className="size-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold leading-none">
            Nova Motocicleta
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Cadastre o chassi e o modelo para adicionar ao estoque
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="chassi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chassi</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: 9BWHE21JX24060961"
                    className="font-mono uppercase"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                </FormControl>
                <FormDescription>17 caracteres, sem espaços</FormDescription>
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
                  <Input placeholder="Ex: Honda CG 160" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="forecastArrival"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Previsão de Chegada</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        {field.value ? (
                          format(new Date(field.value), "dd/MM/yyyy", {
                            locale: ptBR,
                          })
                        ) : (
                          <span>Selecione a previsão (opcional)</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/inventory")}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="min-w-[140px]"
            >
              {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isPending ? "Salvando..." : "Salvar Motocicleta"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
