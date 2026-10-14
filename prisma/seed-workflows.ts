import "dotenv/config";
import { randomBytes, randomInt, scryptSync } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { businessDate } from "../lib/arrival";
import { prisma } from "../lib/db";
import { validateDocument } from "../lib/document";

// Reuse the QR engine already installed with the browser scanner.
const browserRequire = createRequire(
  createRequire(import.meta.url).resolve("@zxing/browser"),
);
const {
  QRCodeWriter,
  BarcodeFormat,
  QRCodeReader,
  BinaryBitmap,
  HybridBinarizer,
  RGBLuminanceSource,
  DecodeHintType,
} = browserRequire("@zxing/library");
const output = resolve("test-artifacts/workflows");
const marker = "[TESTE]";
const id = (group: number, n: number) =>
  `a09e2026-1010-4${String(group).padStart(3, "0")}-8000-${String(n).padStart(12, "0")}`;
const now = new Date();
const today = businessDate(now);
const date = (offset: number) =>
  new Date(new Date(`${today}T00:00:00Z`).getTime() + offset * 86400000);
function document(n: number) {
  let digits = String(700000000 + n);
  for (const length of [9, 10]) {
    const sum = [...digits].reduce(
      (total, digit, i) => total + Number(digit) * (length + 1 - i),
      0,
    );
    const remainder = (sum * 10) % 11;
    digits += remainder === 10 ? 0 : remainder;
  }
  return digits;
}
const scenarios = [
  "Sem previsão: receber manualmente",
  "Hoje: receber por CHASSI",
  "Hoje: receber por QR",
  "Vencida: atraso derivado antes do cron",
  "Atrasada: receber fora do prazo",
  "Amanhã: chegada antecipada",
  "Já recebida: repetir sem alterar horário",
  "Recebida atrasada: permanece Chegou",
  "Legado: Chegou sem horário histórico",
  "Previsão futura com flag de atraso antiga",
  "Sem previsão com flag de atraso antiga",
  "Recebida: excluir operador e preservar histórico",
];
const clients = Array.from({ length: 35 }, (_, i) => ({
  id: id(1, i + 1),
  document: document(i + 1),
  name: `${marker} Cliente ${String(i + 1).padStart(2, "0")}`,
  sellersName: `${marker} Vendedor ${(i % 3) + 1}`,
  city: ["São Paulo", "Campinas", "Santos"][i % 3],
  billingDate: date(-i % 7),
}));
const motorcycles = Array.from({ length: 72 }, (_, i) => {
  const n = i + 1;
  const offset = [null, 0, 0, -1, -2, 1, 0, -1, -3, 2, null, 0][i % 12];
  const received = [6, 7, 8, 11].includes(i % 12);
  return {
    id: id(2, n),
    chassi: `TESTAUGE${String(n).padStart(9, "0")}`,
    model: `${marker} ${["CG 160 Titan", "Bros 160", "CB 300F", "PCX 160"][i % 4]}`,
    clientId: i % 4 === 0 ? null : clients[i % 34].id,
    forecastArrival: offset === null ? null : date(offset),
    forecastArrivalStatus: received
      ? ("ARRIVED" as const)
      : [4, 9, 10].includes(i % 12)
        ? ("DELAYED" as const)
        : ("NO_INFORMATION" as const),
    arrivedAt: received && i % 12 !== 8 ? now : null,
    registrationStatus: ["NO_PLATE", "PLATING", "PLATED"][i % 3] as
      | "NO_PLATE"
      | "PLATING"
      | "PLATED",
    registrationDate: i % 3 ? date(-1) : null,
  };
});
const operators = ["recebimento", "revogado", "excluir"].map((label, i) => {
  const pin = String(randomInt(100000000)).padStart(8, "0");
  const salt = randomBytes(16).toString("hex");
  return {
    id: id(3, i + 1),
    name: `${marker} Operador ${label}`,
    identifier: `teste.${label}`,
    active: label !== "revogado",
    pinHash: `${salt}:${scryptSync(pin, salt, 64).toString("hex")}`,
    pin,
  };
});
const escapeHtml = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
function qr(payload: string) {
  const matrix = new QRCodeWriter().encode(
    payload,
    BarcodeFormat.QR_CODE,
    240,
    240,
    new Map(),
  );
  const pixels = new Int32Array(240 * 240);
  let path = "";
  for (let y = 0; y < 240; y++)
    for (let x = 0; x < 240; x++) {
      const dark = matrix.get(x, y);
      pixels[y * 240 + x] = dark ? 0 : 0xffffff;
      if (dark) path += `M${x} ${y}h1v1h-1z`;
    }
  const decoded = new QRCodeReader()
    .decode(
      new BinaryBitmap(
        new HybridBinarizer(new RGBLuminanceSource(pixels, 240, 240)),
      ),
      new Map([[DecodeHintType.PURE_BARCODE, true]]),
    )
    .getText();
  if (decoded !== payload) throw new Error("Falha na validação do QR gerado.");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240" aria-label="${escapeHtml(payload)}"><rect width="240" height="240" fill="white"/><path d="${path}" fill="black"/></svg>`;
}
async function main() {
  // Fail before writes if fixtures or the installed QR engine are invalid.
  if (clients.some((client) => !validateDocument(client.document))) {
    throw new Error("CPF inválido no seed.");
  }
  qr(motorcycles[0].chassi);
  await mkdir(output, { recursive: true });
  let credentials: Record<string, string> = {};
  try {
    credentials = JSON.parse(
      await readFile(resolve(output, "pins.json"), "utf8"),
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const created = await prisma.$transaction(
    async (tx) => {
      const existingClients = await tx.client.findMany({
        where: {
          OR: [
            { id: { in: clients.map((c) => c.id) } },
            { document: { in: clients.map((c) => c.document) } },
          ],
        },
      });
      const existingMotos = await tx.motorcycle.findMany({
        where: {
          OR: [
            { id: { in: motorcycles.map((m) => m.id) } },
            { chassi: { in: motorcycles.map((m) => m.chassi) } },
          ],
        },
      });
      const existingOperators = await tx.checkInOperator.findMany({
        where: {
          OR: [
            { id: { in: operators.map((o) => o.id) } },
            { identifier: { in: operators.map((o) => o.identifier) } },
          ],
        },
      });
      for (const c of existingClients)
        if (
          !clients.some((f) => f.id === c.id && f.document === c.document) ||
          !c.name.startsWith(marker)
        )
          throw new Error(
            "Colisão com cliente existente; nenhuma alteração aplicada.",
          );
      for (const m of existingMotos)
        if (
          !motorcycles.some((f) => f.id === m.id && f.chassi === m.chassi) ||
          !m.model.startsWith(marker)
        )
          throw new Error(
            "Colisão com moto existente; nenhuma alteração aplicada.",
          );
      for (const o of existingOperators)
        if (
          !operators.some(
            (f) => f.id === o.id && f.identifier === o.identifier,
          ) ||
          !o.name.startsWith(marker)
        )
          throw new Error(
            "Colisão com operador existente; nenhuma alteração aplicada.",
          );
      const newOperators = operators.filter(
        (o) => !existingOperators.some((e) => e.id === o.id),
      );
      const c = await tx.client.createMany({
        data: clients.filter(
          (c) => !existingClients.some((e) => e.id === c.id),
        ),
      });
      const o = await tx.checkInOperator.createMany({
        data: newOperators.map(({ pin: _pin, ...record }) => record),
      });
      const newMotos = motorcycles.filter(
        (m) => !existingMotos.some((e) => e.id === m.id),
      );
      const m = await tx.motorcycle.createMany({ data: newMotos });
      await tx.motorcycleReceipt.createMany({
        data: newMotos
          .filter((m) => m.arrivedAt)
          .map((m) => ({
            id: id(4, Number(m.chassi.slice(8))),
            motorcycleId: m.id,
            operatorId: operators[m.chassi.endsWith("12") ? 2 : 0].id,
            actorLabel: `${marker} Operador ${m.chassi.endsWith("12") ? "excluir" : "recebimento"}`,
            source: "MANUAL",
            arrivedAt: m.arrivedAt as Date,
          })),
      });
      for (const operator of newOperators)
        credentials[operator.identifier] = operator.pin;
      for (const existing of existingOperators) {
        const pin = credentials[existing.identifier];
        const [salt, hash] = existing.pinHash.split(":");
        if (!pin || scryptSync(pin, salt, 64).toString("hex") !== hash)
          delete credentials[existing.identifier];
      }
      return { clients: c.count, motorcycles: m.count, operators: o.count };
    },
    { timeout: 60000 },
  );
  await writeFile(
    resolve(output, "pins.json"),
    JSON.stringify(credentials, null, 2),
  );
  const actual = await prisma.motorcycle.findMany({
    where: { id: { in: motorcycles.map((m) => m.id) } },
    orderBy: { chassi: "asc" },
  });
  const cards = actual
    .map(
      (m, i) =>
        `<article>${qr(m.chassi)}<h2>${m.chassi}</h2><p>${scenarios[i % 12]}</p><p>Previsão: ${m.forecastArrival?.toISOString().slice(0, 10) ?? "Sem previsão"}</p><p>Recebida: ${m.arrivedAt?.toISOString() ?? m.forecastArrivalStatus}</p></article>`,
    )
    .join("");
  await writeFile(
    resolve(output, "qr-catalog.html"),
    `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Testes Auge — QR codes</title><style>body{font:16px system-ui;margin:24px;background:#eee}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}article{background:white;padding:16px;break-inside:avoid;text-align:center}h2{font-size:17px}@media print{body{background:white}main{grid-template-columns:1fr 1fr}}</style><h1>Dados fictícios de teste — Auge</h1><p>Data base: ${today}. Abra /check-in e use o PIN local. QR contém apenas o chassi.</p><main>${cards}<article>${qr("TESTAUGE999999999")}<h2>Não encontrada</h2></article></main></html>`,
  );
  await writeFile(
    resolve(output, "manual.md"),
    `# Teste manual — base ${today}\n\nDados fictícios, identificados por [TESTE].\n\n## Acesso /check-in\n\n${operators.map((o) => `- ${o.identifier}: PIN ${credentials[o.identifier] ?? "indisponível; gere outro em /squad/check-in"}${o.active ? "" : " (revogado: deve negar acesso)"}`).join("\n")}\n\n## Cenários principais\n\n${actual
      .slice(0, 12)
      .map((m, i) => `- ${m.chassi}: ${scenarios[i]}`)
      .join(
        "\n",
      )}\n\nAbra qr-catalog.html em outra tela ou imprima para ler com a câmera. A câmera requer localhost ou HTTPS e permissão do navegador. Confirmar a chegada exige consultar e confirmar explicitamente. Repetir preserva o primeiro horário.\n\nBDC: 35 clientes, 72 motos, clientes sem moto e com várias motos, três vendedores/cidades e todos os status de emplacamento. Cliente sem moto: ${clients[34].name}, CPF ${clients[34].document}. Teste filtros, paginação, edição e exclusão somente dos registros [TESTE].\n\nOperadores: use teste.excluir para testar exclusão; a moto TESTAUGE000000012 mantém o histórico. teste.revogado deve negar login. Para bloqueio, erre o PIN de um operador de teste cinco vezes; para rotação, gere novo PIN na administração e verifique o antigo.\n\nCron: previsões vencidas aparecem atrasadas mesmo antes da execução. O cron real afeta todas as motos vencidas do banco; este seed não executa o cron. Uma previsão de hoje vence à meia-noite de São Paulo.\n\nReexecutar o seed apenas cria registros ausentes: não restaura PIN nem desfaz chegadas, edições ou revogações. Datas dos registros existentes permanecem na data original.\n`,
  );
  console.log(
    JSON.stringify(
      {
        created,
        available: actual.length,
        date: today,
        catalog: resolve(output, "qr-catalog.html"),
        guide: resolve(output, "manual.md"),
      },
      null,
      2,
    ),
  );
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
