import { UserPlus } from "lucide-react";

export function UsersEmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-10 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
        <UserPlus className="size-5 text-muted-foreground" />
      </div>

      <div>
        <p className="text-sm font-medium">Nenhum usuário cadastrado</p>

        <p className="text-xs text-muted-foreground">
          Use o formulário ao lado para criar o primeiro acesso
        </p>
      </div>
    </div>
  );
}
