"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  type ForecastDateRange,
  forecastDateRangeSchema,
  formatForecastDateRange,
} from "@/lib/forecast-date-range";
import { Button } from "./button";
import { Input } from "./input";

export function ForecastDateFilter({
  forecastFrom,
  forecastTo,
  disabled,
  onApply,
}: ForecastDateRange & {
  disabled: boolean;
  onApply: (range: ForecastDateRange) => void;
}) {
  const id = useId();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const periodLabel = formatForecastDateRange({ forecastFrom, forecastTo });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForecastDateRange>({
    resolver: zodResolver(forecastDateRangeSchema),
    defaultValues: { forecastFrom, forecastTo },
  });

  useEffect(() => {
    reset({ forecastFrom, forecastTo });
  }, [forecastFrom, forecastTo, reset]);

  return (
    <details
      ref={detailsRef}
      className="collapse collapse-arrow rounded-xl border border-base-300 bg-base-200/40"
    >
      <summary className="collapse-title flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 py-3 pl-3 pr-10 text-sm focus-visible:outline-2 focus-visible:outline-primary">
        <span className="flex items-center gap-2 font-medium">
          <CalendarDays
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
          Previsão de chegada
        </span>
        <span className="text-xs text-muted-foreground">
          {periodLabel || "Selecionar período"}
        </span>
      </summary>
      <div className="collapse-content px-3">
        <form
          onSubmit={handleSubmit((range) => {
            onApply(range);
            if (detailsRef.current) detailsRef.current.open = false;
          })}
          noValidate
        >
          <fieldset
            disabled={disabled}
            className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]"
          >
            <legend className="sr-only">Período da previsão de chegada</legend>
            <label
              htmlFor={`${id}-from`}
              className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground"
            >
              Data inicial
              <Input
                type="date"
                lang="pt-BR"
                id={`${id}-from`}
                {...register("forecastFrom")}
                aria-invalid={Boolean(errors.forecastFrom)}
                aria-describedby={
                  errors.forecastFrom ? `${id}-error` : undefined
                }
              />
            </label>
            <label
              htmlFor={`${id}-to`}
              className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground"
            >
              Data final
              <Input
                type="date"
                lang="pt-BR"
                id={`${id}-to`}
                {...register("forecastTo")}
                aria-invalid={Boolean(errors.forecastTo)}
                aria-describedby={errors.forecastTo ? `${id}-error` : undefined}
              />
            </label>
            <Button type="submit" variant="outline">
              Aplicar período
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                const empty = { forecastFrom: "", forecastTo: "" };
                reset(empty);
                onApply(empty);
                if (detailsRef.current) detailsRef.current.open = false;
              }}
            >
              <X aria-hidden="true" className="mr-2 size-4" />
              Limpar período
            </Button>
          </fieldset>
          {(errors.forecastFrom || errors.forecastTo) && (
            <p
              id={`${id}-error`}
              role="alert"
              className="mt-2 text-sm text-error"
            >
              {errors.forecastTo?.message || "Informe uma data válida."}
            </p>
          )}
        </form>
      </div>
    </details>
  );
}
