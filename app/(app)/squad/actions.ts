"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { createUser, deleteUser, updateUserAccount } from "@/lib/data/user";
import {
  type CreateUserInput,
  createUserSchema,
} from "@/validators/create-user-schema";
import {
  type UpdateUserInput,
  updateUserSchema,
} from "@/validators/update-user-schema";

export async function createUserAction(data: CreateUserInput) {
  await requireAdmin();

  const parsed = createUserSchema.safeParse(data);
  if (!parsed.success) {
    return {
      status: "error" as const,
      message: "Dados do formulário inválidos.",
    };
  }

  try {
    await createUser({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      role: parsed.data.role,
    });

    revalidatePath("/squad");

    return {
      status: "success" as const,
      message: "Usuário criado com sucesso.",
    };
  } catch (error) {
    console.error("[createUser] Erro ao criar usuário:", {
      name: parsed.data.name,
      email: parsed.data.email,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      status: "error" as const,
      message:
        error instanceof Error
          ? error.message
          : "Erro interno ao criar usuário.",
    };
  }
}

export async function updateUserAction(data: UpdateUserInput) {
  await requireAdmin();

  const parsed = updateUserSchema.safeParse(data);
  if (!parsed.success) {
    return {
      status: "error" as const,
      message: "Dados do formulário inválidos.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await updateUserAccount(parsed.data.userId, {
      name: parsed.data.name,
      image: parsed.data.image,
      newPassword: parsed.data.newPassword,
    });

    revalidatePath("/squad");

    return {
      status: "success" as const,
      message: "Usuário atualizado com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);

    return {
      status: "error" as const,
      message:
        error instanceof Error
          ? error.message
          : "Erro interno ao atualizar usuário.",
    };
  }
}

export async function deleteUserAction(userId: string) {
  await requireAdmin();

  try {
    await deleteUser(userId);

    revalidatePath("/squad");

    return {
      status: "success" as const,
      message: "Usuário removido com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);

    return {
      status: "error" as const,
      message: "Erro interno ao remover usuário.",
    };
  }
}
