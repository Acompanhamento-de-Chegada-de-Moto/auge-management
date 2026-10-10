"use client";

import { Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataWorkspace } from "@/components/ui/data-workspace";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ListPagination } from "@/components/ui/list-pagination";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SquadUser } from "../types";
import { UserMobileCard } from "./user-mobile-card";
import { UsersTableRow } from "./users-table-row";

const PAGE_SIZE = 8;
export function UsersTable({ users }: { users: SquadUser[] }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    return users.filter(
      (user) =>
        !query ||
        user.name.toLocaleLowerCase("pt-BR").includes(query) ||
        user.email.toLocaleLowerCase("pt-BR").includes(query),
    );
  }, [search, users]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const pageUsers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const changeSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };
  return (
    <section aria-label="Usuários da equipe">
      <DataWorkspace
        title="Usuários e permissões"
        description="Consulte a equipe e gerencie o acesso por perfil."
        total={filtered.length}
        unit="usuários"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-300 p-4 sm:px-5">
          <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="size-4" aria-hidden="true" /> {users.length}{" "}
            usuários cadastrados
          </p>
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              aria-label="Buscar usuários por nome ou e-mail"
              placeholder="Buscar por nome ou e-mail"
              value={search}
              onChange={(event) => changeSearch(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        {pageUsers.length === 0 ? (
          <EmptyState
            title={
              search ? "Nenhum usuário encontrado" : "Sua equipe aparecerá aqui"
            }
            description={
              search
                ? "Tente outro nome ou e-mail para localizar o usuário."
                : "Use Adicionar usuário para cadastrar o primeiro integrante da equipe."
            }
            action={
              search ? (
                <Button variant="outline" onClick={() => changeSearch("")}>
                  Limpar busca
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="space-y-3 p-3 md:hidden">
              {pageUsers.map((user) => (
                <UserMobileCard key={user.id} user={user} />
              ))}
            </div>
            <div className="hidden md:block">
              <Table>
                <caption className="sr-only">
                  Equipe com permissões, cadastro e ações administrativas.
                </caption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Permissão</TableHead>
                    <TableHead>Data de cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageUsers.map((user) => (
                    <UsersTableRow key={user.id} user={user} />
                  ))}
                </TableBody>
              </Table>
            </div>
            <ListPagination
              label="Paginação da equipe"
              page={page}
              totalPages={totalPages}
              isPending={false}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </DataWorkspace>
    </section>
  );
}
