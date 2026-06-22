import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const requireManager = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
    redirect("/tracking");
  }

  return session;
});
