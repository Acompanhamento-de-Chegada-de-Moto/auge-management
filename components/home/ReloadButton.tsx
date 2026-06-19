"use client";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReloadButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => window.location.reload()}
    >
      <RotateCw className="size-4" />
    </Button>
  );
}
