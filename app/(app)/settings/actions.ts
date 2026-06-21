"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { getUsers, createUser, updateUser, setUserPassword, deleteUser } from "@/lib/data/user";
import { upsertSetting } from "@/lib/data/settings";
import {
  type CreateUserInput,
  createUserSchema,
} from "@/validators/create-user-schema";
import {
  type UpdateUserInput,
  updateUserSchema,
} from "@/validators/update-user-schema";

export async function getUsersAction() {
  await requireAdmin();
  return getUsers();
}

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
    });

    revalidatePath("/settings");

    return {
      status: "success" as const,
      message: "Usuário criado com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);

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
    await updateUser(parsed.data.userId, {
      name: parsed.data.name,
      image: parsed.data.image,
    });

    if (parsed.data.newPassword) {
      await setUserPassword(parsed.data.userId, parsed.data.newPassword);
    }

    revalidatePath("/settings");

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

    revalidatePath("/settings");

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

export async function saveSettingAction(key: string, value: string) {
  await requireAdmin();

  try {
    await upsertSetting(key, value);

    revalidatePath("/settings/system");

    return { status: "success" as const, message: "Configuração salva." };
  } catch (error) {
    console.error("Erro ao salvar configuração:", error);

    return {
      status: "error" as const,
      message: "Erro interno ao salvar configuração.",
    };
  }
}
