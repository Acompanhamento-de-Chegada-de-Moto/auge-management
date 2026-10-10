"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod/v3";
import { DateInput } from "@/components/DateInput";
import { FormWorkspace } from "@/components/layout/FormWorkspace";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApiResponse } from "@/lib/types";
import {
  type CreateMotorcycleType,
  createMotorcycleSchema,
} from "@/lib/zod-schemas/motorcycle-schema";

interface MotorcycleFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<CreateMotorcycleType>;
  action: (values: CreateMotorcycleType) => Promise<ApiResponse>;
}

export function MotorcycleForm({
  mode,
  initialValues,
  action,
}: MotorcycleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<
    z.input<typeof createMotorcycleSchema>,
    undefined,
    CreateMotorcycleType
  >({
    resolver: zodResolver(createMotorcycleSchema),
    defaultValues: {
      chassi: initialValues?.chassi ?? "",
      model: initialValues?.model ?? "",
      forecastArrival: initialValues?.forecastArrival
        ? new Date(initialValues.forecastArrival)
        : undefined,
      forecastArrivalStatus:
        initialValues?.forecastArrivalStatus ?? "NO_INFORMATION",
    },
  });

  const forecastArrival = form.watch("forecastArrival");
  const forecastArrivalStatus = form.watch("forecastArrivalStatus");

  function handleSubmit(values: CreateMotorcycleType) {
    startTransition(async () => {
      try {
        const result = await action(values);
        if (result.status === "error") {
          form.setError("root.serverError", {
            type: "server",
            message: result.message,
          });
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        router.push("/inventory");
        router.refresh();
      } catch {
        toast.error("Não foi possível salvar a motocicleta. Tente novamente.");
      }
    });
  }

  return (
    <FormWorkspace
      title="Controle de estoque"
      steps={[
        "O chassi identifica uma unidade e deve ser único.",
        "A previsão de chegada é opcional. Confirme o status conforme a situação real da unidade.",
        "Na edição, alterar o chassi mantém o cadastro e o vínculo com o cliente.",
      ]}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-7">
            <section className="space-y-4">
              <div>
                <h2 className="text-base font-semibold">Identificação</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Informe os dados que identificam esta motocicleta no estoque.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="chassi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chassi</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoCapitalize="characters"
                          className="font-mono uppercase"
                          placeholder="Ex.: 9BWHE21JX24060961"
                          onChange={(event) =>
                            field.onChange(event.target.value.toUpperCase())
                          }
                        />
                      </FormControl>
                      <FormDescription>Até 17 caracteres.</FormDescription>
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
                        <Input {...field} placeholder="Ex.: Honda CG 160" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <section className="space-y-4 border-t pt-6">
              <div>
                <h2 className="text-base font-semibold">Chegada</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  A previsão é opcional. Sem data, a unidade permanece sem
                  previsão.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="forecastArrival"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Previsão de chegada</FormLabel>
                      <FormControl>
                        <DateInput
                          name={field.name}
                          ref={field.ref}
                          value={field.value as Date | undefined}
                          onValueChange={field.onChange}
                          onBlur={field.onBlur}
                          className="input h-11 w-full rounded-xl border-base-300 bg-base-100 px-3.5 text-sm shadow-none focus:border-primary focus:outline-2 focus:outline-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-error"
                        />
                      </FormControl>
                      {field.value && (
                        <Button
                          type="button"
                          variant="link"
                          className="h-auto w-fit p-0 text-xs text-muted-foreground"
                          onClick={() => field.onChange(undefined)}
                        >
                          Remover data
                        </Button>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="forecastArrivalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status de chegada</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NO_INFORMATION">
                            Sem confirmação
                          </SelectItem>
                          <SelectItem value="ARRIVED">Chegou</SelectItem>
                          <SelectItem value="DELAYED">Atrasada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {forecastArrival &&
                dayjs(forecastArrival)
                  .startOf("day")
                  .isBefore(dayjs().startOf("day")) &&
                forecastArrivalStatus === "NO_INFORMATION" && (
                  <p
                    aria-live="polite"
                    className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
                  >
                    A previsão já passou. Atualize o status para confirmar a
                    chegada ou registrar o atraso.
                  </p>
                )}
            </section>

            {form.formState.errors.root?.serverError?.message && (
              <p
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {form.formState.errors.root.serverError.message}
              </p>
            )}
          </div>

          <footer className="flex flex-col-reverse gap-2 mt-6 border-t border-base-300 bg-base-100 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => router.push("/inventory")}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="sm:min-w-44">
              {isPending ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              {isPending
                ? mode === "create"
                  ? "Salvando…"
                  : "Salvando…"
                : mode === "create"
                  ? "Adicionar ao estoque"
                  : "Salvar alterações"}
            </Button>
          </footer>
        </form>
      </Form>
    </FormWorkspace>
  );
}
