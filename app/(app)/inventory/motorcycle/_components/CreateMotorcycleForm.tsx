"use client";

import { CreateMotorcycleAction } from "../new/actions";
import { MotorcycleForm } from "./MotorcycleForm";

export function CreateMotorcycleForm() {
  return <MotorcycleForm mode="create" action={CreateMotorcycleAction} />;
}
