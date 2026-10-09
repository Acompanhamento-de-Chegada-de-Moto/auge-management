"use client";

import type { getMotorcycleByIdWithClient } from "@/lib/data/motorcycle";
import { MotorcycleForm } from "../../../_components/MotorcycleForm";
import { apiMutation } from "@/lib/api/client";

type Motorcycle = NonNullable<
  Awaited<ReturnType<typeof getMotorcycleByIdWithClient>>
>;

export function EditMotorcycleForm({ motorcycle }: { motorcycle: Motorcycle }) {
  return (
    <MotorcycleForm
      mode="edit"
      initialValues={motorcycle}
      action={(values) =>
        apiMutation(
          `/api/v1/inventory/motorcycles/${motorcycle.id}`,
          "PUT",
          values,
        )
      }
    />
  );
}
