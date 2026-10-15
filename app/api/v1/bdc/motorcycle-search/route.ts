import { authorizeApiRequest, apiError } from "@/lib/api/auth";
import { getMotorcycleLookupByChassis } from "@/lib/data/motorcycle";

export async function GET(request: Request) {
  const authorization = await authorizeApiRequest(request);
  if (authorization.response) return authorization.response;

  const chassis = new URL(request.url).searchParams.get("chassis")?.trim();
  if (!chassis || chassis.length > 17) {
    return apiError("Informe um chassi válido.", 400);
  }

  try {
    const motorcycle = await getMotorcycleLookupByChassis(
      chassis.toUpperCase(),
    );
    return Response.json(motorcycle);
  } catch (error) {
    console.error("[api/v1/bdc/motorcycle-search] Falha na consulta:", error);
    return apiError("Erro interno ao consultar o chassi.", 500);
  }
}
