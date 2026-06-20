import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
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
      createdAt: true,
      banned: true,
    },
  });
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  return auth.api.createUser({
    body: {
      name: data.name,
      email: data.email,
      password: data.password,
      role: "user",
    },
  });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}
