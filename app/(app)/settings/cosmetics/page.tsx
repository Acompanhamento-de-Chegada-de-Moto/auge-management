import { Suspense } from "react";

import { requireManager } from "@/app/data/admin/require-manager";
import { getSetting } from "@/lib/data/settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ModeToggle } from "@/components/ModeToggle";
import { LogoUploadForm } from "./_components/LogoUploadForm";

function CosmeticsSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <Skeleton className="mx-auto h-5 w-32" />
          <Skeleton className="mx-auto mt-1 h-4 w-48" />
        </CardHeader>
        <CardContent className="flex justify-center">
          <Skeleton className="size-11 rounded-full" />
        </CardContent>
      </Card>
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-1 h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="mx-auto size-20 rounded-lg" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="ml-auto h-9 w-24" />
        </CardContent>
      </Card>
    </div>
  );
}

async function RenderCosmetics() {
  const logoUrl = await getSetting("logo_url");

  return (
    <div className="space-y-6">
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

      <LogoUploadForm currentLogoUrl={logoUrl} />
    </div>
  );
}

export default async function CosmeticsPage() {
  await requireManager();

  return (
    <Suspense fallback={<CosmeticsSkeleton />}>
      <RenderCosmetics />
    </Suspense>
  );
}
