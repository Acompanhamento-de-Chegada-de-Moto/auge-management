import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteUser, updateUserAccount } from "@/lib/data/user";
import {
  type MutationActor,
  type MutationResult,
  mutationError,
  mutationSuccess,
} from "@/lib/server/mutation-result";
import { updateUserSchema } from "@/validators/update-user-schema";

const idSchema = z.string().min(1).max(100);

export async function updateTeamUser(
  input: unknown,
  _actor: MutationActor,
  userId: string,
): Promise<MutationResult> {
  if (!idSchema.safeParse(userId).success)
    return mutationError("ID inválido.", 400);

  try {
    const body = input;
    const payload =
      typeof body === "object" && body !== null && !Array.isArray(body)
        ? body
        : {};
    const parsed = updateUserSchema.safeParse({ ...payload, userId });
    if (!parsed.success)
      return mutationError(
        parsed.error.issues[0]?.message ?? "Dados inválidos.",
        400,
      );
    await updateUserAccount(parsed.data.userId, {
      name: parsed.data.name,
      image: parsed.data.image,
      newPassword: parsed.data.newPassword,
    });
    revalidatePath("/squad");
    return mutationSuccess({ message: "Usuário atualizado com sucesso." });
  } catch (error) {
    console.error("[service/admin/users/:userId] Falha ao atualizar:", error);
    return mutationError("Não foi possível atualizar o usuário.", 500);
  }
}

export async function removeTeamUser(
  _input: unknown,
  actor: MutationActor,
  userId: string,
): Promise<MutationResult> {
  if (!idSchema.safeParse(userId).success)
    return mutationError("ID inválido.", 400);
  if (actor.user.id === userId)
    return mutationError("Não é possível remover a própria conta.", 400);

  try {
    await deleteUser(userId);
    revalidatePath("/squad");
    return mutationSuccess({ message: "Usuário removido com sucesso." });
  } catch (error) {
    console.error("[service/admin/users/:userId] Falha ao excluir:", error);
    return mutationError("Não foi possível remover o usuário.", 500);
  }
}
