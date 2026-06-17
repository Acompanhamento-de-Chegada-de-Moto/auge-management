import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateUserForm } from "./_components/create-user-form";

export const metadata: Metadata = {
  title: "Configurações",
};

export default async function ConfiguracoesPage() {
  // const users = await adminGetUsers();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie os usuários do sistema.
        </p>
      </div>

      <div className="mb-10 max-w-sm">
        <CreateUserForm />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Criado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  Nenhum usuário cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
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
                  <TableCell>
                    {user.createdAt.toLocaleDateString("pt-BR")}
                  </TableCell>
                </TableRow>
              ))
            )} */}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
