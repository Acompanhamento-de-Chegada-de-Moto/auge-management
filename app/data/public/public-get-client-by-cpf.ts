import "server-only";

import { getPublicClientByCpf } from "@/lib/data/client";

export async function PublicGetClientByCPF(cpf: string) {
  return getPublicClientByCpf(cpf);
}

export type PublicGetClientByCPFType = Awaited<
  ReturnType<typeof PublicGetClientByCPF>
>;
