"use client";

import { UserPlus } from "lucide-react";

import { CreateUserForm } from "./create-user-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreateUserDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 size-4" />
          Adicionar usuário
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo usuário</DialogTitle>
          <DialogDescription>
            Preencha os dados para cadastrar um usuário na equipe.
          </DialogDescription>
        </DialogHeader>

        <CreateUserForm />
      </DialogContent>
    </Dialog>
  );
}
