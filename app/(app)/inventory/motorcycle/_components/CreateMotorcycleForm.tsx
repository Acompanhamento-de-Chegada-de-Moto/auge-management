"use client";

import { createMotorcycleAction } from "@/app/(app)/inventory/_actions/motorcycles";
import { MotorcycleForm } from "./MotorcycleForm";

export function CreateMotorcycleForm() {
  return (
    <MotorcycleForm
      mode="create"
      action={(values) => createMotorcycleAction(values)}
    />
  );
}
