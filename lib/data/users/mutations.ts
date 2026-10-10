import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: "USER" | "MANAGER" | "ADMIN";
}) {
  const result = await auth.api.createUser({
    body: {
      name: data.name,
      email: data.email,
      password: data.password,
      role: (data.role ?? "USER") as "admin" | "user",
    },
  });

  try {
    await auth.api.setUserPassword({
      body: {
        userId: result.user.id,
        newPassword: data.password,
      },
    });
  } catch {
    // Se o linkAccount falhou no createUser, o setUserPassword cria o credential account
  }

  return result;
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}

export async function updateUser(
  id: string,
  data: { name?: string; image?: string },
) {
  return prisma.user.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.image !== undefined && { image: data.image || null }),
    },
  });
}

export async function setUserPassword(id: string, newPassword: string) {
  return auth.api.setUserPassword({
    body: {
      userId: id,
      newPassword,
    },
  });
}

export async function updateUserAccount(
  id: string,
  data: { name?: string; image?: string; newPassword?: string },
) {
  await updateUser(id, { name: data.name, image: data.image });
  if (data.newPassword) await setUserPassword(id, data.newPassword);
}
