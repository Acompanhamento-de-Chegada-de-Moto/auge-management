"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CopyLinkButtonProps {
  url: string;
}

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${url}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="gap-1.5 text-xs"
    >
      {copied ? (
        <>
          <CheckIcon className="size-3.5 text-green-600 dark:text-green-400" />
          <span className="text-green-600 dark:text-green-400">Copiado!</span>
        </>
      ) : (
        <>
          <CopyIcon className="size-3.5" />
          Copiar link
        </>
      )}
    </Button>
  );
}
