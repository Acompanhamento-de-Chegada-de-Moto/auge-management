import { runApiMutation } from "@/lib/server/api-mutation";
import {
  removeInventoryMotorcycle,
  updateInventoryMotorcycle,
} from "@/lib/services/inventory/motorcycle";

type RouteContext = { params: Promise<{ motorcycleId: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  const { motorcycleId } = await params;
  return runApiMutation(request, {
    roles: undefined,
    execute: (input, actor) =>
      updateInventoryMotorcycle(input, actor, motorcycleId),
  });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { motorcycleId } = await params;
  return runApiMutation(request, {
    roles: undefined,
    execute: (input, actor) =>
      removeInventoryMotorcycle(input, actor, motorcycleId),
  });
}
