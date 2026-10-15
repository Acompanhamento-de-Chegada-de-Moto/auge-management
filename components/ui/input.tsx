import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "input h-11 w-full min-w-0 rounded-xl border-base-300 bg-base-100 px-3.5 text-base shadow-none transition-colors placeholder:text-base-content/45 focus:border-primary focus:outline-2 focus:outline-offset-0 focus:outline-primary/30 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-error aria-invalid:outline-error md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
