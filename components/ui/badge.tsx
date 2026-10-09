import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";
import { Slot } from "@/components/ui/slot";

const badgeVariants = cva(
  "badge group/badge h-6 w-fit shrink-0 gap-1 rounded-full border-transparent px-2.5 text-xs font-medium whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "badge-primary",
        secondary: "badge-secondary",
        destructive: "badge-error badge-soft",
        outline: "badge-outline border-base-300 text-base-content",
        ghost: "badge-ghost",
        link: "badge-ghost text-primary underline-offset-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
