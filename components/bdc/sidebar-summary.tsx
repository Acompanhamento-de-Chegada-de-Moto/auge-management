"use client";

import {
  AlertTriangleIcon,
  Car,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Clock,
  FileText,
  MapPin,
  Package,
  Tag,
  Truck,
  User,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SidebarSummaryProps {
  chassis: string;
  found: boolean;
  model?: string;
  city?: string;
  customerName?: string;
  sellerName?: string;
  registrationStatus?: string;
  hasArrived?: boolean;
  arrivalDate?: Date | null;
}

function getStatusBadge(found: boolean, arrivalDate?: Date | null) {
  if (!found) {
    return {
      label: "Não Encontrado",
      color:
        "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400",
      icon: AlertTriangleIcon,
    };
  }

  if (!arrivalDate) {
    return {
      label: "Sem Previsão",
      color:
        "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
      icon: Clock,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const arrival = new Date(arrivalDate);
  arrival.setHours(0, 0, 0, 0);

  if (arrival > today) {
    return {
      label: "Na Logística",
      color:
        "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400",
      icon: Package,
    };
  }

  return {
    label: "Chegou",
    color:
      "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    icon: CheckCircle2Icon,
  };
}

export function SidebarSummary({
  chassis,
  found,
  model,
  city,
  customerName,
  sellerName,
  registrationStatus,
  hasArrived,
  arrivalDate,
}: SidebarSummaryProps) {
  const [collapsed, setCollapsed] = useState(false);

  const hasData = chassis || customerName || model;
  const status = getStatusBadge(found, arrivalDate);
  const StatusIcon = status.icon;

  return (
    <aside
      className={`relative shrink-0 transition-all duration-300 ${
        collapsed ? "w-12" : "w-full lg:w-80"
      }`}
    >
      <div className="sticky top-4 rounded-lg border bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          {!collapsed && <h3 className="text-sm font-semibold">Resumo</h3>}
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expandir" : "Colapsar"}
          >
            {collapsed ? (
              <ChevronLeftIcon className="size-4" />
            ) : (
              <ChevronRightIcon className="size-4" />
            )}
          </Button>
        </div>

        {!collapsed && (
          <div className="space-y-4">
            {!hasData ? (
              <p className="text-sm text-muted-foreground">
                Consulte um chassi para ver o resumo.
              </p>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className={status.color}>
                    <StatusIcon className="mr-1 size-3" />
                    {status.label}
                  </Badge>
                </div>

                {chassis && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Tag className="size-3" />
                      <span>Chassi</span>
                    </div>
                    <p className="text-sm font-medium">{chassis}</p>
                  </div>
                )}

                {model && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Car className="size-3" />
                      <span>Modelo</span>
                    </div>
                    <p className="text-sm font-medium">{model}</p>
                  </div>
                )}

                {city && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      <span>Cidade</span>
                    </div>
                    <p className="text-sm font-medium">{city}</p>
                  </div>
                )}

                {customerName && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="size-3" />
                      <span>Cliente</span>
                    </div>
                    <p className="text-sm font-medium">{customerName}</p>
                  </div>
                )}

                {sellerName && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="size-3" />
                      <span>Vendedor</span>
                    </div>
                    <p className="text-sm font-medium">{sellerName}</p>
                  </div>
                )}

                {hasArrived !== undefined && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Truck className="size-3" />
                      <span>Chegou na Loja</span>
                    </div>
                    <p className="text-sm font-medium">
                      {hasArrived ? "Sim" : "Não"}
                    </p>
                  </div>
                )}

                {registrationStatus && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="size-3" />
                      <span>Status Emplacamento</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {registrationStatus}
                    </Badge>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
