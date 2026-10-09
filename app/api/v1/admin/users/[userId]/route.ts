import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  authorizeApiRequest,
  assertSameOrigin,
  apiError,
  readJsonBody,
} from "@/lib/api/auth";
import { deleteUser, updateUserAccount } from "@/lib/data/user";
import { updateUserSchema } from "@/validators/update-user-schema";

type RouteContext = { params: Promise<{ userId: string }> };
const idSchema = z.string().min(1).max(100);

export async function PUT(request: Request, { params }: RouteContext) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const authorization = await authorizeApiRequest(request, ["ADMIN"]);
  if (authorization.response) return authorization.response;

  const { userId } = await params;
  if (!idSchema.safeParse(userId).success) return apiError("ID inválido.", 400);

  try {
    const body = await readJsonBody(request);
    const payload =
      typeof body === "object" && body !== null && !Array.isArray(body)
        ? body
        : {};
    const parsed = updateUserSchema.safeParse({ ...payload, userId });
    if (!parsed.success)
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos.",
        400,
      );
    await updateUserAccount(parsed.data.userId, {
      name: parsed.data.name,
      image: parsed.data.image,
      newPassword: parsed.data.newPassword,
    });
    revalidatePath("/squad");
    return Response.json({ message: "Usuário atualizado com sucesso." });
  } catch (error) {
    if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE")
      return apiError("Requisição muito grande.", 413);
    if (error instanceof SyntaxError) return apiError("JSON inválido.", 400);
    console.error("[api/v1/admin/users/:userId] Falha ao atualizar:", error);
    return apiError("Não foi possível atualizar o usuário.", 500);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const authorization = await authorizeApiRequest(request, ["ADMIN"]);
  if (authorization.response) return authorization.response;

  const { userId } = await params;
  if (!idSchema.safeParse(userId).success) return apiError("ID inválido.", 400);
  if (authorization.session.user.id === userId)
    return apiError("Não é possível remover a própria conta.", 400);

  try {
    await deleteUser(userId);
    revalidatePath("/squad");
    return Response.json({ message: "Usuário removido com sucesso." });
  } catch (error) {
    console.error("[api/v1/admin/users/:userId] Falha ao excluir:", error);
    return apiError("Não foi possível remover o usuário.", 500);
  }
}
