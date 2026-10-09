"use client";

import { CalendarDays } from "lucide-react";
import { useEffect, useState, type ComponentProps } from "react";

function toInputDate(value: Date | string | null | undefined) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromInputDate(value: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function formatBrazilianDate(value: Date | string | null | undefined) {
  const inputDate = toInputDate(value);
  if (!inputDate) return "";
  const [year, month, day] = inputDate.split("-");
  return `${day}/${month}/${year}`;
}

function maskBrazilianDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function parseBrazilianDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return undefined;
  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const date = new Date(year, month - 1, day, 12);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  return date;
}

type DateInputProps = Omit<
  ComponentProps<"input">,
  "type" | "value" | "onChange"
> & {
  value?: Date | string | null;
  onValueChange: (value: Date | undefined) => void;
};

export function DateInput({
  value,
  onValueChange,
  className,
  ...props
}: DateInputProps) {
  const [draft, setDraft] = useState(() => formatBrazilianDate(value));
  const [focused, setFocused] = useState(false);
  const nativeValue = toInputDate(value);

  useEffect(() => {
    if (!focused) setDraft(formatBrazilianDate(value));
  }, [focused, value]);

  function handleTextChange(nextValue: string) {
    const maskedValue = maskBrazilianDate(nextValue);
    setDraft(maskedValue);
    onValueChange(maskedValue ? parseBrazilianDate(maskedValue) : undefined);
  }

  return (
    <div className="relative">
      <input
        {...props}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd/mm/aaaa"
        data-slot="date-input"
        className={`${className ?? ""} pr-10`}
        value={draft}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        onChange={(event) => handleTextChange(event.currentTarget.value)}
      />
      <CalendarDays
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-base-content/60"
      />
      <input
        type="date"
        lang="pt-BR"
        tabIndex={-1}
        aria-hidden="true"
        disabled={props.disabled}
        value={nativeValue}
        onChange={(event) => {
          const nextDate = fromInputDate(event.currentTarget.value);
          setDraft(formatBrazilianDate(nextDate));
          onValueChange(nextDate);
        }}
        className="absolute right-0 top-0 h-full w-11 cursor-pointer opacity-0"
      />
    </div>
  );
}
