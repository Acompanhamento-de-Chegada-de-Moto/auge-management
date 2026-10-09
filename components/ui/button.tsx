import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";
import { Slot } from "@/components/ui/slot";

const buttonVariants = cva(
  "btn group/button min-h-10 shrink-0 rounded-xl border-transparent text-sm font-medium normal-case shadow-none transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "btn-primary",
        outline:
          "btn-outline border-base-300 bg-base-100 text-base-content hover:border-base-300 hover:bg-base-200",
        secondary: "btn-secondary border-transparent",
        ghost: "btn-ghost hover:bg-base-200",
        destructive: "btn-error border-transparent text-error-content",
        link: "btn-link text-primary underline-offset-4",
      },
      size: {
        default: "h-10 gap-2 px-4",
        xs: "btn-xs min-h-7 gap-1 rounded-lg px-2 text-xs",
        sm: "btn-sm min-h-8 gap-1.5 rounded-lg px-3 text-xs",
        lg: "btn-lg min-h-12 gap-2.5 px-5",
        icon: "btn-square size-10 p-0",
        "icon-xs": "btn-square btn-xs size-7 p-0",
        "icon-sm": "btn-square btn-sm size-8 p-0",
        "icon-lg": "btn-square btn-lg size-12 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
