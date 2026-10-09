"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type SwitchProps = Omit<
  ComponentProps<"input">,
  "type" | "checked" | "defaultChecked" | "onChange" | "size"
> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: ComponentProps<"input">["onChange"];
  size?: "sm" | "default";
};

function Switch({
  className,
  size = "default",
  onCheckedChange,
  onChange,
  ...props
}: SwitchProps) {
  return (
    <input
      type="checkbox"
      role="switch"
      data-slot="switch"
      data-size={size}
      className={cn(
        "toggle toggle-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "toggle-sm",
        className,
      )}
      onChange={(event) => {
        onChange?.(event);
        onCheckedChange?.(event.currentTarget.checked);
      }}
      {...props}
    />
  );
}

export { Switch };
