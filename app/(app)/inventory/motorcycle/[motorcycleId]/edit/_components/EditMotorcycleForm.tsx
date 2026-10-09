"use client";

import { EditMotorcycleAction } from "../actions";
import { MotorcycleForm } from "../../../_components/MotorcycleForm";
import type { getMotorcycleByIdWithClient } from "@/lib/data/motorcycle";

type Motorcycle = NonNullable<
  Awaited<ReturnType<typeof getMotorcycleByIdWithClient>>
>;

export function EditMotorcycleForm({ motorcycle }: { motorcycle: Motorcycle }) {
  return (
    <MotorcycleForm
      mode="edit"
      initialValues={motorcycle}
      action={(values) => EditMotorcycleAction(motorcycle.id, values)}
    />
  );
}
