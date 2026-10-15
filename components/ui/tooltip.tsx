"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@/components/ui/slot";

function TooltipProvider({
  children,
}: {
  children: React.ReactNode;
  delayDuration?: number;
}) {
  return <>{children}</>;
}

function Tooltip({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="tooltip"
      className={cn("group/tooltip relative inline-flex", className)}
      {...props}
    >
      {children}
    </span>
  );
}

function TooltipTrigger({
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"span"> & { asChild?: boolean }) {
  if (asChild) {
    return (
      <Slot.Root data-slot="tooltip-trigger" {...props}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <span data-slot="tooltip-trigger" tabIndex={0} {...props}>
      {children}
    </span>
  );
}

function TooltipContent({
  className,
  children,
  sideOffset: _sideOffset,
  side = "top",
  align = "center",
  ...props
}: React.ComponentProps<"span"> & {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}) {
  const sideClasses = {
    top: "bottom-full mb-2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
    bottom: "top-full mt-2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
  }[side];
  const alignClasses =
    side === "left" || side === "right"
      ? align === "start"
        ? "top-0 translate-y-0"
        : align === "end"
          ? "bottom-0 top-auto translate-y-0"
          : ""
      : align === "start"
        ? "left-0 translate-x-0"
        : align === "end"
          ? "right-0 left-auto translate-x-0"
          : "left-1/2 -translate-x-1/2";

  return (
    <span
      data-slot="tooltip-content"
      role="tooltip"
      className={cn(
        "pointer-events-none absolute z-50 w-max max-w-xs rounded-lg bg-neutral px-3 py-2 text-xs text-neutral-content opacity-0 shadow-lg transition-opacity group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
        sideClasses,
        alignClasses,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
