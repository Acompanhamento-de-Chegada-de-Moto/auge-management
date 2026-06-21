import { Suspense } from "react";

import { requireAdmin } from "@/app/data/admin/require-admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ModeToggle } from "@/components/ModeToggle";

function CosmeticsSkeleton() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <Skeleton className="mx-auto h-5 w-32" />
        <Skeleton className="mx-auto mt-1 h-4 w-48" />
      </CardHeader>
      <CardContent className="flex justify-center">
        <Skeleton className="size-11 rounded-full" />
      </CardContent>
    </Card>
  );
}

async function RenderCosmetics() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-base">Tema do Sistema</CardTitle>
        <CardDescription>
          Escolha entre claro, escuro ou seguir o sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <ModeToggle />
      </CardContent>
    </Card>
  );
}

export default async function CosmeticsPage() {
  await requireAdmin();

  return (
    <Suspense fallback={<CosmeticsSkeleton />}>
      <RenderCosmetics />
    </Suspense>
  );
}
