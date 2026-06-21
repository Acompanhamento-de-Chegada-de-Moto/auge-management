import { Suspense } from "react";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { adminGetUsers } from "@/app/data/admin/admin-get-users";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateUserForm } from "./_components/CreateUserForm";
import { UsersTable } from "./_components/UsersTable";

function SettingsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base">Usuários cadastrados</CardTitle>
            <CardDescription>Carregando...</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <div className="border-b">
              <div className="grid grid-cols-3 px-4 py-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16 justify-self-end" />
              </div>
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-3 items-center px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-44 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-24 justify-self-end" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit lg:sticky lg:top-20">
        <CardHeader>
          <CardTitle className="text-base">Novo usuário</CardTitle>
          <CardDescription>
            Crie um acesso para um novo membro da equipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function RenderUsers() {
  const users = await adminGetUsers();

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base">Usuários cadastrados</CardTitle>
            <CardDescription>
              {users.length === 0
                ? "Nenhum usuário ainda"
                : `${users.length} usuário(s) com acesso ao sistema`}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="hidden sm:flex">
            {users.length} total
          </Badge>
        </CardHeader>
        <CardContent>
          <UsersTable users={users} />
        </CardContent>
      </Card>

      <Card className="h-fit lg:sticky lg:top-20">
        <CardHeader>
          <CardTitle className="text-base">Novo usuário</CardTitle>
          <CardDescription>
            Crie um acesso para um novo membro da equipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateUserForm />
        </CardContent>
      </Card>
    </>
  );
}

export default async function SettingsPage() {
  await requireAdmin();

  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <RenderUsers />
    </Suspense>
  );
}
