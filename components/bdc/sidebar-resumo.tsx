"use client";

import { useState } from "react";
import {
  CheckCircle2Icon,
  AlertTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Car,
  User,
  MapPin,
  Tag,
  Truck,
  FileText,
  Package,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SidebarResumoProps {
  chassi: string;
  found: boolean;
  modelo?: string;
  cidade?: string;
  cliente?: string;
  vendedor?: string;
  statusRegistro?: string;
  motoChegou?: boolean;
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

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const chegada = new Date(arrivalDate);
  chegada.setHours(0, 0, 0, 0);

  if (chegada > hoje) {
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

export function SidebarResumo({
  chassi,
  found,
  modelo,
  cidade,
  cliente,
  vendedor,
  statusRegistro,
  motoChegou,
  arrivalDate,
}: SidebarResumoProps) {
  const [collapsed, setCollapsed] = useState(false);

  const hasData = chassi || cliente || modelo;
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

                {chassi && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Tag className="size-3" />
                      <span>Chassi</span>
                    </div>
                    <p className="text-sm font-medium">{chassi}</p>
                  </div>
                )}

                {modelo && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Car className="size-3" />
                      <span>Modelo</span>
                    </div>
                    <p className="text-sm font-medium">{modelo}</p>
                  </div>
                )}

                {cidade && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      <span>Cidade</span>
                    </div>
                    <p className="text-sm font-medium">{cidade}</p>
                  </div>
                )}

                {cliente && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="size-3" />
                      <span>Cliente</span>
                    </div>
                    <p className="text-sm font-medium">{cliente}</p>
                  </div>
                )}

                {vendedor && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="size-3" />
                      <span>Vendedor</span>
                    </div>
                    <p className="text-sm font-medium">{vendedor}</p>
                  </div>
                )}

                {motoChegou !== undefined && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Truck className="size-3" />
                      <span>Chegou na Loja</span>
                    </div>
                    <p className="text-sm font-medium">
                      {motoChegou ? "Sim" : "Não"}
                    </p>
                  </div>
                )}

                {statusRegistro && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="size-3" />
                      <span>Status Emplacamento</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {statusRegistro}
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
