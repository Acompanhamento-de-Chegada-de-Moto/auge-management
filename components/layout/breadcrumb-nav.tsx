"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

const routeMap: Record<string, BreadcrumbSegment[]> = {
  "/bdc": [{ label: "bdc", href: "/bdc" }],
  "/bdc/cliente/novo": [
    { label: "bdc", href: "/bdc" },
    { label: "novo cliente" },
  ],
  "/bdc/cliente/editar": [
    { label: "bdc", href: "/bdc" },
    { label: "editar cliente" },
  ],
  "/logistica": [{ label: "logística", href: "/logistica" }],
  "/logistica/motocicleta/novo": [
    { label: "logística", href: "/logistica" },
    { label: "nova motocicleta" },
  ],
  "/logistica/motocicleta/editar": [
    { label: "logística", href: "/logistica" },
    { label: "editar motocicleta" },
  ],
  "/configuracoes": [{ label: "configurações" }],
};

function getBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  // Tenta match exato primeiro
  if (routeMap[pathname]) {
    return routeMap[pathname];
  }

  // Fallback para rotas com query params (ex: /bdc/cliente/editar?q=...)
  const cleanPath = pathname.split("?")[0];
  if (routeMap[cleanPath]) {
    return routeMap[cleanPath];
  }

  return [];
}

export function BreadcrumbNav() {
  const pathname = usePathname();
  const segments = getBreadcrumbs(pathname);

  if (segments.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;

          return (
            <>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast || !segment.href ? (
                  <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={segment.href}>{segment.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
