"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { EditMotorcycleAction } from "@/app/(app)/inventory/actions";
import { useMotorcycle } from "@/app/(app)/inventory/_hooks/use-motorcycle";
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
import { cn } from "@/lib/utils";
import {
  type CreateMotorcycleType,
  createMotorcycleSchema,
} from "@/lib/zod-schemas/motorcycle-schema";

interface EditMotorcycleFormProps {
  motorcycleId: string;
}

export function EditMotorcycleForm({
  motorcycleId,
}: EditMotorcycleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useMotorcycle(motorcycleId);

  const form = useForm({
    resolver: zodResolver(createMotorcycleSchema),
    values: data
      ? {
          chassi: data.chassi,
          model: data.model,
          forecastArrival: data.forecastArrival
            ? new Date(data.forecastArrival)
            : undefined,
          forecastArrivalStatus: "NO_INFORMATION",
        }
      : undefined,
  });

  const handleSubmit = useCallback(
    async (formData: CreateMotorcycleType) => {
      startTransition(async () => {
        const result = await EditMotorcycleAction(motorcycleId, formData);

        if (result.status === "success") {
          queryClient.invalidateQueries({
            queryKey: ["motorcycle", motorcycleId],
          });
          toast.success(result.message);
          router.push("/inventory");
        } else {
          toast.error(result.message);
          form.setError("chassi", {
            type: "manual",
            message: result.message,
          });
        }
      });
    },
    [router, form, queryClient, motorcycleId],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Erro ao carregar dados da motocicleta.
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 max-w-xl"
      >
        <FormField
          control={form.control}
          name="chassi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chassi</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 9BWHE21JX24060961" {...field} />
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
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isPending} className="min-w-[120px]">
            {isPending ? "Atualizando..." : "Salvar Alterações"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => router.push("/inventory")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
