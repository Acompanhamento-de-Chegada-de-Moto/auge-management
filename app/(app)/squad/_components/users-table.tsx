"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SquadUser } from "../types";
import { UserMobileCard } from "./user-mobile-card";
import { UsersTableRow } from "./users-table-row";

interface UsersTableProps {
  users: SquadUser[];
}

const PAGE_SIZE = 8;

export function UsersTable({ users }: UsersTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");

    if (!query) return users;

    return users.filter((user) => {
      return (
        user.name.toLocaleLowerCase("pt-BR").includes(query) ||
        user.email.toLocaleLowerCase("pt-BR").includes(query)
      );
    });
  }, [search, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * PAGE_SIZE;
  const pageUsers = filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);
  const hasUsers = users.length > 0;
  const hasResults = filteredUsers.length > 0;

  function handleSearchChange(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Usuários</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {users.length}{" "}
            {users.length === 1 ? "usuário cadastrado" : "usuários cadastrados"}
          </p>
        </div>

        {hasUsers && (
          <div className="relative w-full sm:max-w-xs">
            <Search
              aria-hidden="true"
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              aria-label="Buscar usuários por nome ou e-mail"
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="pl-9"
            />
          </div>
        )}
      </div>

      {!hasUsers ? (
        <div
          role="status"
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card px-4 py-12 text-center shadow-sm"
        >
          <div className="flex size-11 items-center justify-center rounded-full bg-muted">
            <Users className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Nenhum usuário cadastrado</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Os usuários cadastrados aparecerão aqui.
            </p>
          </div>
        </div>
      ) : !hasResults ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-10 text-center">
          <Search className="size-5 text-muted-foreground" />
          <p className="text-sm font-medium">Nenhum resultado encontrado</p>
          <p className="text-sm text-muted-foreground">
            Tente buscar por outro nome ou e-mail.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSearchChange("")}
          >
            Limpar busca
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {pageUsers.map((user) => (
              <UserMobileCard key={user.id} user={user} />
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-border/70 bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Usuário</TableHead>
                  <TableHead>Permissão</TableHead>
                  <TableHead>Data de cadastro</TableHead>
                  <TableHead className="w-16 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageUsers.map((user) => (
                  <UsersTableRow key={user.id} user={user} />
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Exibindo {startIndex + 1}–
              {Math.min(startIndex + PAGE_SIZE, filteredUsers.length)} de{" "}
              {filteredUsers.length}{" "}
              {filteredUsers.length === 1 ? "usuário" : "usuários"}
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8"
                  aria-label="Página anterior"
                  disabled={page === 1}
                  onClick={() => setCurrentPage(page - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="min-w-20 text-center text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8"
                  aria-label="Próxima página"
                  disabled={page === totalPages}
                  onClick={() => setCurrentPage(page + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
