"use client";

import { Pencil } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";
import { initialsOf } from "@/lib/utils";
import { UserComponentProps } from "../types";
import { UserRoleBadge } from "./user-role-badge";
import { EditUserDialog } from "./edit-user-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";

export function UsersTableRow({ user }: UserComponentProps) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-9 shrink-0">
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback className="text-xs">
              {initialsOf(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <UserRoleBadge role={user.role} />
      </TableCell>

      <TableCell className="text-sm text-muted-foreground">
        {new Date(user.createdAt).toLocaleDateString("pt-BR")}
      </TableCell>

      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <EditUserDialog
            user={user}
            trigger={
              <button
                type="button"
                aria-label={`Editar usuário ${user.name}`}
                className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Pencil className="size-4" />
              </button>
            }
          />

          <DeleteUserDialog userId={user.id} userName={user.name} />
        </div>
      </TableCell>
    </TableRow>
  );
}
