import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";

export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export const requireAuth = cache(async (): Promise<User> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };
});

export const requireUser = cache(async (): Promise<User> => {
  const user = await requireAuth();

  if (user.role !== "ADMIN") {
    redirect("/bdc");
  }

  return user;
});
