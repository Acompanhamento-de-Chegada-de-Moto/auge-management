"use client";

import { Pencil } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initialsOf } from "@/lib/utils";
import { UserComponentProps } from "../types";
import { UserRoleBadge } from "./user-role-badge";
import { EditUserDialog } from "./edit-user-dialog";

export function UserMobileCard({ user }: UserComponentProps) {
  return (
    <article className="flex min-w-0 items-center gap-3 rounded-lg border bg-card p-3">
      <Avatar className="size-10 shrink-0">
        {user.image && <AvatarImage src={user.image} alt={user.name} />}
        <AvatarFallback className="text-xs">
          {initialsOf(user.name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        <div className="mt-2">
          <UserRoleBadge role={user.role} />
        </div>
      </div>

      <EditUserDialog
        user={user}
        trigger={
          <button
            type="button"
            aria-label={`Editar usuário ${user.name}`}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Pencil className="size-4" />
          </button>
        }
      />
    </article>
  );
}
