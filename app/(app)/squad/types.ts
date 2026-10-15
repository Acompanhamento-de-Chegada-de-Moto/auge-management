import type { adminGetUsers } from "@/app/data/admin/admin-get-users";

export type SquadUser = Awaited<ReturnType<typeof adminGetUsers>>[number];

export interface UserComponentProps {
  user: SquadUser;
}
