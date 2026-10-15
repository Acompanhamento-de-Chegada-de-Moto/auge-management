"use server";

import { runActionMutation } from "@/lib/server/action-mutation";
import { createTeamUser } from "@/lib/services/users/create-user";
import { removeTeamUser, updateTeamUser } from "@/lib/services/users/user";

export async function createUserAction(input: unknown) {
  return runActionMutation({
    input,
    scope: "/api/v1/admin/users",
    method: "POST",
    roles: ["ADMIN"],
    execute: (actor) => createTeamUser(input, actor),
  });
}

export async function updateUserAction(id: string, input: unknown) {
  return runActionMutation({
    input,
    scope: "/api/v1/admin/users/:id",
    method: "PUT",
    roles: ["ADMIN"],
    execute: (actor) => updateTeamUser(input, actor, id),
  });
}

export async function deleteUserAction(id: string) {
  return runActionMutation({
    input: id,
    scope: "/api/v1/admin/users/:id",
    method: "DELETE",
    roles: ["ADMIN"],
    execute: (actor) => removeTeamUser(undefined, actor, id),
  });
}
