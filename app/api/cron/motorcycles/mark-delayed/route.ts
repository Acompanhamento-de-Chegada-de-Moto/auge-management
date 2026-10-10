import { timingSafeEqual } from "node:crypto";
import { revalidateArrivals } from "@/lib/check-in/revalidate";
import { markOverdueMotorcycles } from "@/lib/data/check-in";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get("authorization") ?? "";
  if (!secret)
    return Response.json(
      { error: "Agendador não configurado." },
      { status: 503 },
    );
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(supplied);
  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  )
    return Response.json({ error: "Acesso negado." }, { status: 401 });
  const result = await markOverdueMotorcycles();
  revalidateArrivals("route");
  return Response.json({
    updated: result.count,
    timeZone: "America/Sao_Paulo",
  });
}
