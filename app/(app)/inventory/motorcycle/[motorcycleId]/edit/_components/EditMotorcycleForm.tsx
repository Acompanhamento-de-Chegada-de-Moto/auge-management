"use client";

import { updateMotorcycleAction } from "@/app/(app)/inventory/_actions/motorcycles";
import type { getMotorcycleByIdWithClient } from "@/lib/data/motorcycle";
import { MotorcycleForm } from "../../../_components/MotorcycleForm";

type Motorcycle = NonNullable<
  Awaited<ReturnType<typeof getMotorcycleByIdWithClient>>
>;

export function EditMotorcycleForm({ motorcycle }: { motorcycle: Motorcycle }) {
  return (
    <MotorcycleForm
      mode="edit"
      initialValues={motorcycle}
      action={(values) => updateMotorcycleAction(motorcycle.id, values)}
    />
  );
}
