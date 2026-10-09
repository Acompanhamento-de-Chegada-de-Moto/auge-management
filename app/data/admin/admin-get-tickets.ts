import "server-only";

import { getAllTickets, getTicketsByCreator } from "@/lib/data/ticket";
import { requireAdmin } from "./require-admin";
import { requireManager } from "./require-manager";

export async function adminGetAllTickets() {
  await requireAdmin();
  return getAllTickets();
}

export type AdminTicket = Awaited<
  ReturnType<typeof adminGetAllTickets>
>[number];

export async function managerGetOwnTickets(userId: string) {
  await requireManager();
  return getTicketsByCreator(userId);
}

export type ManagerTicket = Awaited<
  ReturnType<typeof managerGetOwnTickets>
>[number];
