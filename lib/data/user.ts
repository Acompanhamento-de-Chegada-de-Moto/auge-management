import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
      banned: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
      banned: true,
    },
  });
}

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
