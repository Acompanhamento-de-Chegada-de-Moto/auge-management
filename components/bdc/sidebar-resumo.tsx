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
}: SidebarResumoProps) {
  const [collapsed, setCollapsed] = useState(false);

  const hasData = chassi || cliente || modelo;

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
                  {found ? (
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                    >
                      <CheckCircle2Icon className="mr-1 size-3" />
                      Na Logística
                    </Badge>
                  ) : (
                    <Badge
                      variant="default"
                      className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400"
                    >
                      <AlertTriangleIcon className="mr-1 size-3" />
                      Não Encontrado
                    </Badge>
                  )}
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
