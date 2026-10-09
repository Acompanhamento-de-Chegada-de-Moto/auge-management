"use client";

import { apiMutation } from "@/lib/api/client";
import { MotorcycleForm } from "./MotorcycleForm";

export function CreateMotorcycleForm() {
  return (
    <MotorcycleForm
      mode="create"
      action={(values) =>
        apiMutation("/api/v1/inventory/motorcycles", "POST", values)
      }
    />
  );
}
