// components/ThemeColorSync.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');

    const temp = document.createElement("div");
    temp.style.color = "var(--primary)";
    document.body.appendChild(temp);
    const color = getComputedStyle(temp).color;
    document.body.removeChild(temp);

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
