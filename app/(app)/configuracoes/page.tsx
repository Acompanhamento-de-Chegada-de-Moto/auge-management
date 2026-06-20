// page.tsx — Configurações > Usuários

import { UserPlus, Users } from "lucide-react";
import type { Metadata } from "next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { CreateUserForm } from "./_components/CreateUserForm";

export const metadata: Metadata = {
  title: "Configurações",
};

// Mock temporário até o backend voltar a funcionar
const users: any[] = [];

function initialsOf(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default async function ConfiguracoesPage() {
  // const users = await adminGetUsers();

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

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        {/* Listagem — ocupa a coluna principal */}
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
            {users.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-10 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <UserPlus className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Nenhum usuário cadastrado
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use o formulário ao lado para criar o primeiro acesso
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Mobile: cards */}
                <div className="space-y-3 md:hidden">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <Avatar className="size-9">
                        <AvatarFallback className="text-xs">
                          {initialsOf(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          user.role === "ADMIN"
                            ? "border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            : "border-gray-200 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                        }
                      >
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* Desktop: tabela */}
                <div className="hidden rounded-lg border md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Usuário</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Criado em</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8">
                                <AvatarFallback className="text-xs">
                                  {initialsOf(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium leading-tight">
                                  {user.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                user.role === "ADMIN"
                                  ? "border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "border-gray-200 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                              }
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {user.createdAt.toLocaleDateString("pt-BR")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Form — coluna lateral, fica "ancorado" como ação rápida */}
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
      </div>
    </div>
  );
}
