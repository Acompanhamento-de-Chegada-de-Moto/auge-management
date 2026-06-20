// components/ThemeColorSync.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    const color = resolvedTheme === "dark" ? "#1e293b" : "#0f172a";

    if (meta) {
      meta.setAttribute("content", color);
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "theme-color";
      newMeta.content = color;
      document.head.appendChild(newMeta);
    }
  }, [resolvedTheme]);

  return null;
}
