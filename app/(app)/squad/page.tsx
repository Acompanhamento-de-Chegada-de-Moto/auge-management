import { adminGetUsers } from "@/app/data/admin/admin-get-users";
import { CreateUserDialog } from "./_components/create-user-dialog";
import { UsersTable } from "./_components/users-table";

export default async function SquadPage() {
  const users = await adminGetUsers();

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Equipe</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os usuários e suas permissões de acesso.
          </p>
        </div>

        <CreateUserDialog />
      </header>

      <UsersTable users={users} />
    </div>
  );
}
