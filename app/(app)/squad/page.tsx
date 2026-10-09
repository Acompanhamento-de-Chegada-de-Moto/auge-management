import { adminGetUsers } from "@/app/data/admin/admin-get-users";
import { CreateUserDialog } from "./_components/create-user-dialog";
import { UsersTable } from "./_components/users-table";

export default async function SquadPage() {
  const users = await adminGetUsers();

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-5 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Administração
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Equipe
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os usuários e suas permissões de acesso.
          </p>
        </div>

        <CreateUserDialog />
      </header>

      <UsersTable users={users} />
    </main>
  );
}
