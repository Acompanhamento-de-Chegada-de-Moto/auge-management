"use client";

import {
  Calendar,
  ChartArea,
  ChartNoAxesColumnIncreasing,
  ClipboardList,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { DashboardSummary } from "@/lib/data/dashboard";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface KpiCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
}

function KpiCard({ title, value, icon: Icon }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

interface RankTableProps {
  title: string;
  description: string;
  rows: Array<{ label: string; count: number }>;
  emptyMessage?: string;
}

function RankTable({ title, description, rows, emptyMessage }: RankTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {emptyMessage ?? "Nenhum dado disponível"}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 text-muted-foreground">#</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="text-end">Quantidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={row.label} className="hover:bg-transparent">
                  <TableCell className="text-muted-foreground tabular-nums">
                    {i + 1}
                  </TableCell>
                  <TableCell>{row.label}</TableCell>
                  <TableCell className="text-end tabular-nums">
                    {row.count}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardClientProps {
  data: DashboardSummary;
}

export function DashboardClient({ data }: DashboardClientProps) {
  const totalStatus =
    data.arrivalStatus.emTransito +
    data.arrivalStatus.chegou +
    data.arrivalStatus.atrasada;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Clientes"
          value={data.totalClients}
          icon={Users}
        />
        <KpiCard
          title="Motocicletas"
          value={data.totalMotorcycles}
          icon={ClipboardList}
        />
        <KpiCard
          title="Últimos 30 Dias (Clientes)"
          value={data.recentClients}
          icon={Calendar}
        />
        <KpiCard
          title="Últimos 30 Dias (Motos)"
          value={data.recentMotorcycles}
          icon={ChartArea}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status de Chegada</CardTitle>
            <CardDescription>
              Distribuição das motocicletas por situação atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <StatusBar
                label="Em Trânsito"
                value={data.arrivalStatus.emTransito}
                total={totalStatus}
                color="bg-amber-500"
                badgeVariant="secondary"
              />
              <StatusBar
                label="Chegou"
                value={data.arrivalStatus.chegou}
                total={totalStatus}
                color="bg-green-500"
                badgeVariant="default"
              />
              <StatusBar
                label="Atrasada"
                value={data.arrivalStatus.atrasada}
                total={totalStatus}
                color="bg-red-500"
                badgeVariant="destructive"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status de Emplacamento</CardTitle>
            <CardDescription>
              Motocicletas por estágio de emplacamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <StatusBar
                label="Pendente"
                value={data.registrationStatus.noPlate}
                total={data.totalMotorcycles}
                color="bg-muted-foreground/40"
                badgeVariant="outline"
              />
              <StatusBar
                label="Em Emplacamento"
                value={data.registrationStatus.plating}
                total={data.totalMotorcycles}
                color="bg-blue-500"
                badgeVariant="secondary"
              />
              <StatusBar
                label="Emplacado"
                value={data.registrationStatus.plated}
                total={data.totalMotorcycles}
                color="bg-green-500"
                badgeVariant="default"
              />
            </div>
          </CardContent>
        </Card>

        <RankTable
          title="Top Vendedores"
          description="Clientes cadastrados por vendedor"
          rows={data.topSellers.map((s) => ({
            label: s.sellersName,
            count: s.count,
          }))}
          emptyMessage="Nenhum vendedor encontrado"
        />

        <RankTable
          title="Modelos Mais Comuns"
          description="Motocicletas por modelo"
          rows={data.models.map((m) => ({
            label: m.model,
            count: m.count,
          }))}
          emptyMessage="Nenhum modelo encontrado"
        />

        <RankTable
          title="Cidades"
          description="Clientes por cidade"
          rows={data.cities.map((c) => ({
            label: c.city,
            count: c.count,
          }))}
          emptyMessage="Nenhuma cidade encontrada"
        />

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
            <div>
              <CardTitle className="text-base">Resumo Geral</CardTitle>
              <CardDescription>
                Panorama consolidado do sistema
              </CardDescription>
            </div>
            <ChartNoAxesColumnIncreasing className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <SummaryRow
              label="Total de Clientes"
              value={data.totalClients}
            />
            <SummaryRow
              label="Total de Motocicletas"
              value={data.totalMotorcycles}
            />
            <SummaryRow
              label="Chegadas"
              value={data.arrivalStatus.chegou}
            />
            <SummaryRow
              label="Em Trânsito"
              value={data.arrivalStatus.emTransito}
            />
            <SummaryRow
              label="Atrasadas"
              value={data.arrivalStatus.atrasada}
            />
            <SummaryRow
              label="Clientes (30 dias)"
              value={data.recentClients}
            />
            <SummaryRow
              label="Motos cadastradas (30 dias)"
              value={data.recentMotorcycles}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusBar({
  label,
  value,
  total,
  color,
  badgeVariant,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span>{label}</span>
        <Badge variant={badgeVariant}>{value}</Badge>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}
