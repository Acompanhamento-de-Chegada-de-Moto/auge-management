import "server-only";
import { revalidatePath } from "next/cache";
import { createUser } from "@/lib/data/user";
import {
  type MutationActor,
  type MutationResult,
  mutationError,
  mutationSuccess,
} from "@/lib/server/mutation-result";
import { createUserSchema } from "@/validators/create-user-schema";

export async function createTeamUser(
  input: unknown,
  _actor: MutationActor,
): Promise<MutationResult> {
  try {
    const parsed = createUserSchema.safeParse(input);
    if (!parsed.success)
      return mutationError(
        parsed.error.issues[0]?.message ?? "Dados inválidos.",
        400,
      );
    await createUser(parsed.data);
    revalidatePath("/squad");
    return mutationSuccess(
      { message: "Usuário criado com sucesso." },
      { status: 201 },
    );
  } catch (error) {
    console.error("[service/admin/users] Falha ao criar:", error);
    return mutationError("Não foi possível criar o usuário.", 409);
  }
}
