import { Users } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { getUsers } from "@/lib/data/user";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateUserForm } from "./_components/CreateUserForm";
import { UsersTable } from "./_components/UsersTable";

export const metadata: Metadata = {
  title: "Configurações",
};

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
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Usuário</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-8 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-44 mt-1" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
  const users = await getUsers();

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

export default async function ConfiguracoesPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Users className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight">Usuários</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os acessos ao sistema
          </p>
        </div>
      </div>

      <Suspense fallback={<SettingsSkeleton />}>
        <RenderUsers />
      </Suspense>
    </div>
  );
}
