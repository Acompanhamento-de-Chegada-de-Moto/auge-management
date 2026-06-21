"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { getDashboardSummary } from "@/lib/data/dashboard";

export async function getDashboardDataAction() {
  await requireAdmin();
  return getDashboardSummary();
}
