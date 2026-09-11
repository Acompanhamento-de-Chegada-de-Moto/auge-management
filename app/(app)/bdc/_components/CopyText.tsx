"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

interface CopyTextProps {
  text: string;
  children: React.ReactNode;
  className?: string;
}

export function CopyText({ text, children, className }: CopyTextProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      toast.success("Texto copiado com sucesso!");

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      toast.error("Não foi possível copiar o texto.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-2 cursor-pointer hover:underline",
        className,
      )}
    >
      {children}

      <span className="flex size-4 items-center justify-center">
        {copied ? (
          <Check className="size-4 text-green-500" />
        ) : (
          <Copy className="size-4 text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        )}
      </span>
    </button>
  );
}
