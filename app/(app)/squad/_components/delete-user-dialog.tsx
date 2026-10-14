"use client";
import type { ReactNode } from "react";
import { deleteUserAction } from "@/app/(app)/squad/_actions/users";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

export function DeleteUserDialog({
  userId,
  userName,
  trigger,
}: {
  userId: string;
  userName: string;
  trigger?: ReactNode;
}) {
  return (
    <ConfirmDeleteDialog
      action={() => deleteUserAction(userId)}
      itemType="Usuário"
      itemName={userName}
      triggerLabel={`Excluir usuário ${userName}`}
      trigger={trigger}
      description="A exclusão remove o acesso deste usuário ao sistema. Essa ação não pode ser desfeita."
    />
  );
}
