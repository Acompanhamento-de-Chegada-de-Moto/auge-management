"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { requireManager } from "@/app/data/admin/require-manager";
import { getUsers, createUser, updateUser, setUserPassword, deleteUser } from "@/lib/data/user";
import { getSetting, upsertSetting } from "@/lib/data/settings";
import { uploadLogo } from "@/lib/cloudinary";
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
      role: parsed.data.role,
    });

    revalidatePath("/settings");

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

export async function getLogoUrlAction() {
  return getSetting("logo_url");
}

export async function uploadLogoAction(formData: FormData) {
  await requireManager();

  const file = formData.get("logo") as File | null;
  if (!file) {
    return { status: "error" as const, message: "Nenhum arquivo enviado." };
  }

  if (!file.type.startsWith("image/")) {
    return {
      status: "error" as const,
      message: "Apenas imagens são permitidas.",
    };
  }

  if (file.size > 2 * 1024 * 1024) {
    return {
      status: "error" as const,
      message: "A imagem deve ter no máximo 2MB.",
    };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const url = await uploadLogo(buffer, file.name);

    await upsertSetting("logo_url", url);

    revalidatePath("/settings/cosmetics");

    return { status: "success" as const, message: "Logo atualizada com sucesso." };
  } catch (error) {
    console.error("Erro ao fazer upload da logo:", error);

    return {
      status: "error" as const,
      message: "Erro interno ao fazer upload da logo.",
    };
  }
}

export async function removeLogoAction() {
  await requireManager();

  try {
    await upsertSetting("logo_url", "");

    revalidatePath("/settings/cosmetics");

    return { status: "success" as const, message: "Logo removida. A logo padrão será usada." };
  } catch (error) {
    console.error("Erro ao remover logo:", error);

    return {
      status: "error" as const,
      message: "Erro interno ao remover logo.",
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
