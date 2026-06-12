"use client";

import {
  AlertTriangleIcon,
  CalendarIcon,
  Motorbike,
  ChevronLeftIcon,
  ChevronRightIcon,
  Clock,
  FileText,
  MapPin,
  Tag,
  User,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getForecastStatus } from "@/lib/bdc-data";

interface SidebarSummaryProps {
  chassis: string;
  found: boolean;
  model?: string;
  city?: string;
  customerName?: string;
  sellerName?: string;
  registrationStatus?: string;
  forecastDate?: Date | null;
}

function getStatusBadge(found: boolean, forecastDate?: Date | null) {
  if (!found) {
    return {
      label: "Não Encontrado",
      color:
        "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400",
      icon: AlertTriangleIcon,
    };
  }

  const forecast = getForecastStatus(forecastDate);
  const iconMap = {
    "Sem Previsão": Clock,
    "Previsão Futura": CalendarIcon,
    "Previsão Passada": CalendarIcon,
  } as const;

  return {
    label: forecast.label,
    color: forecast.color,
    icon: iconMap[forecast.label as keyof typeof iconMap] || Clock,
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
  forecastDate,
}: SidebarSummaryProps) {
  const [collapsed, setCollapsed] = useState(false);

  const hasData = chassis || customerName || model;
  const status = getStatusBadge(found, forecastDate);
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
                      <Motorbike className="size-3" />
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
