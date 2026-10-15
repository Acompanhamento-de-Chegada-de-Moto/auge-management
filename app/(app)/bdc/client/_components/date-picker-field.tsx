"use client";

import type { Control, FieldValues, Path } from "react-hook-form";
import { DateInput } from "@/components/DateInput";
import {
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface DatePickerFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  optional?: boolean;
  disabled?: boolean;
}

export function DatePickerField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  optional = false,
  disabled = false,
}: DatePickerFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>
            {label}
            {optional && (
              <span className="ml-1 font-normal text-muted-foreground">
                (opcional)
              </span>
            )}
          </FormLabel>
          <FormControl>
            <DateInput
              name={field.name}
              ref={field.ref}
              disabled={disabled}
              value={field.value as Date | undefined}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              className="input h-11 w-full rounded-xl border-base-300 bg-base-100 px-3.5 pr-10 text-sm shadow-none focus:border-primary focus:outline-2 focus:outline-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-error disabled:cursor-not-allowed disabled:opacity-60"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
