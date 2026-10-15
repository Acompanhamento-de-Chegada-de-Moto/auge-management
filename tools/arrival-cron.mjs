import "dotenv/config";

// One-shot entrypoint for an external scheduler. Never run an in-process timer
// in Next.js: replicas, restarts and serverless instances are not schedulers.
const baseUrl = process.env.BETTER_AUTH_URL;
const secret = process.env.CRON_SECRET;
if (!baseUrl || !secret || secret.length < 32) {
  throw new Error(
    "Configure BETTER_AUTH_URL e CRON_SECRET (mínimo de 32 caracteres) no ambiente do agendador.",
  );
}
const url = new URL("/api/cron/motorcycles/mark-delayed", baseUrl);
if (
  url.protocol !== "https:" &&
  !(
    url.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
  )
) {
  throw new Error("O agendador exige HTTPS fora do localhost.");
}
const response = await fetch(url, {
  method: "POST",
  headers: { authorization: `Bearer ${secret}` },
  signal: AbortSignal.timeout(15_000),
});
if (!response.ok)
  throw new Error(`Falha ao atualizar atrasos: HTTP ${response.status}.`);
console.log(JSON.stringify(await response.json()));
