import { adminGetUsers } from "@/app/data/admin/admin-get-users";
import { Page, PageHeader } from "@/components/layout/Page";
import { CreateUserDialog } from "./_components/create-user-dialog";
import { UsersTable } from "./_components/users-table";

export default async function SquadPage() {
  const users = await adminGetUsers();

  return (
    <Page>
      <PageHeader
        title="Equipe"
        eyebrow="Administração"
        description="Gerencie os usuários e suas permissões de acesso."
        actions={<CreateUserDialog />}
      />

      <UsersTable users={users} />
    </Page>
  );
}
