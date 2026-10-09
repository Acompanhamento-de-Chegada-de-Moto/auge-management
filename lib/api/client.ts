import type { ApiResponse } from "@/lib/types";

export async function apiMutation<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<ApiResponse & { data?: T }> {
  const response = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const result = (await response.json().catch(() => null)) as {
    message?: string;
    error?: string;
    data?: T;
  } | null;
  const message = result?.message ?? result?.error;

  return {
    status: response.ok ? "success" : "error",
    message:
      message ?? (response.ok ? "Operação concluída." : "Falha na requisição."),
    data: result?.data,
  };
}

export async function searchMotorcycleByChassis<T>(
  chassis: string,
): Promise<T | null> {
  const response = await fetch(
    `/api/v1/bdc/motorcycle-search?chassis=${encodeURIComponent(chassis)}`,
    { credentials: "same-origin", cache: "no-store" },
  );
  if (!response.ok) throw new Error("Não foi possível consultar o chassi.");
  return (await response.json()) as T | null;
}
