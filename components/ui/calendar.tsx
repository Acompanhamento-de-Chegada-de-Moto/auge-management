"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type * as React from "react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";
import { cn } from "@/lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = ptBR,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      locale={locale}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4 relative",
        month: "flex flex-col gap-3",

        // Cabeçalho (mês/ano + setas)
        month_caption: "flex justify-center items-center h-9 relative px-9",
        caption_label: "text-sm font-medium capitalize",
        nav: "flex items-center justify-between absolute inset-x-0 top-0 h-9 px-1",
        button_previous: cn(
          "inline-flex items-center justify-center size-7 rounded-md",
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          "transition-colors disabled:opacity-30 disabled:pointer-events-none",
        ),
        button_next: cn(
          "inline-flex items-center justify-center size-7 rounded-md",
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          "transition-colors disabled:opacity-30 disabled:pointer-events-none",
        ),

        // Grade
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-muted-foreground w-9 font-medium text-[0.75rem] uppercase tracking-wide pb-2",
        week: "flex w-full mt-1",
        weeks: "flex flex-col gap-1",

        // Dias
        day: "h-9 w-9 p-0 text-center text-sm relative [&:has([data-selected=true])]:rounded-md",
        day_button: cn(
          "h-9 w-9 p-0 font-normal inline-flex items-center justify-center rounded-md",
          "text-sm transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        ),
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground [&>button]:font-medium",
        today:
          "[&>button]:bg-accent [&>button]:text-accent-foreground [&>button]:font-semibold",
        outside: "[&>button]:text-muted-foreground/40",
        disabled:
          "[&>button]:text-muted-foreground/40 [&>button]:pointer-events-none",
        hidden: "invisible",

        // Range (caso use mode="range" em algum lugar)
        range_start: "[&>button]:rounded-l-md [&>button]:rounded-r-none",
        range_end: "[&>button]:rounded-r-md [&>button]:rounded-l-none",
        range_middle:
          "[&>button]:rounded-none [&>button]:bg-accent [&>button]:text-accent-foreground",

        ...classNames,
      }}
      components={{
        Chevron: ({
          orientation,
          className: chevronClassName,
          ...chevronProps
        }) => {
          const Icon =
            orientation === "left" ? ChevronLeftIcon : ChevronRightIcon;
          return (
            <Icon
              className={cn("size-4", chevronClassName)}
              {...chevronProps}
            />
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
