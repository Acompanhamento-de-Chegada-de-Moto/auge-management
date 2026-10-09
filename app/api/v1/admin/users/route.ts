import { revalidatePath } from "next/cache";
import {
  authorizeApiRequest,
  assertSameOrigin,
  apiError,
  readJsonBody,
} from "@/lib/api/auth";
import { createUser } from "@/lib/data/user";
import { createUserSchema } from "@/validators/create-user-schema";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const authorization = await authorizeApiRequest(request, ["ADMIN"]);
  if (authorization.response) return authorization.response;

  try {
    const parsed = createUserSchema.safeParse(await readJsonBody(request));
    if (!parsed.success)
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos.",
        400,
      );
    await createUser(parsed.data);
    revalidatePath("/squad");
    return Response.json(
      { message: "Usuário criado com sucesso." },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE")
      return apiError("Requisição muito grande.", 413);
    if (error instanceof SyntaxError) return apiError("JSON inválido.", 400);
    console.error("[api/v1/admin/users] Falha ao criar:", error);
    return apiError("Não foi possível criar o usuário.", 409);
  }
}
