"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      if (
        link?.href &&
        !link.target &&
        link.href.startsWith(window.location.origin)
      ) {
        setLoading(true);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    const handler = () => setLoading(true);
    document.addEventListener("submit", handler);
    return () => document.removeEventListener("submit", handler);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-red-600 transition-opacity duration-200 ${
        loading ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}

export function GlobalLoadingBar() {
  return (
    <Suspense fallback={null}>
      <LoadingBar />
    </Suspense>
  );
}
