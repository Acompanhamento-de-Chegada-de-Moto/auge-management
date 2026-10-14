"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { generatePin, hashPin } from "@/lib/check-in/credentials";
import { operatorSchema } from "@/lib/check-in/schemas";
import {
  changeOperatorCredentials,
  createCheckInOperator,
  deleteCheckInOperator,
} from "@/lib/data/check-in";
import { runActionMutation } from "@/lib/server/action-mutation";
import { mutationError, mutationSuccess } from "@/lib/server/mutation-result";

export async function createOperatorAction(input: unknown) {
  return runActionMutation({
    input,
    scope: "/check-in/operators",
    method: "POST",
    roles: ["ADMIN"],
    execute: async () => {
      const parsed = operatorSchema.safeParse(input);
      if (!parsed.success)
        return mutationError(
          parsed.error.issues[0]?.message ?? "Dados inválidos.",
          400,
        );
      const pin = generatePin();
      try {
        await createCheckInOperator({
          ...parsed.data,
          identifier: parsed.data.name.toLowerCase(),
          pinHash: await hashPin(pin),
        });
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2002"
        )
          return mutationError("Nome já cadastrado. Use o nome completo.", 409);
        throw error;
      }
      revalidatePath("/squad/check-in");
      return mutationSuccess({
        message: "Operador cadastrado.",
        data: { pin, identifier: parsed.data.name },
      });
    },
  });
}

export async function rotateOperatorPinAction(id: string) {
  return runActionMutation({
    input: id,
    scope: "/check-in/operators",
    method: "PUT",
    roles: ["ADMIN"],
    execute: async () => {
      if (!z.string().uuid().safeParse(id).success)
        return mutationError("Operador inválido.", 400);
      const pin = generatePin();
      await changeOperatorCredentials(id, await hashPin(pin));
      revalidatePath("/squad/check-in");
      return mutationSuccess({
        message: "PIN renovado e sessões encerradas.",
        data: { pin },
      });
    },
  });
}

export async function revokeOperatorAction(id: string) {
  return runActionMutation({
    input: id,
    scope: "/check-in/operators",
    method: "DELETE",
    roles: ["ADMIN"],
    execute: async () => {
      if (!z.string().uuid().safeParse(id).success)
        return mutationError("Operador inválido.", 400);
      await changeOperatorCredentials(id);
      revalidatePath("/squad/check-in");
      return mutationSuccess({
        message: "Acesso revogado e sessões encerradas.",
      });
    },
  });
}

export async function deleteOperatorAction(id: string) {
  return runActionMutation({
    input: id,
    scope: "/check-in/operators",
    method: "DELETE",
    roles: ["ADMIN"],
    execute: async () => {
      if (!z.string().uuid().safeParse(id).success)
        return mutationError("Operador inválido.", 400);
      // FK rules revoke sessions and detach receipts, keeping actorLabel intact.
      const result = await deleteCheckInOperator(id);
      if (!result.count) return mutationError("Operador não encontrado.", 404);
      revalidatePath("/squad/check-in");
      return mutationSuccess({
        message: "Operador excluído. Histórico de recebimentos preservado.",
      });
    },
  });
}
