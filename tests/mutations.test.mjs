import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);

test("cache Prisma reutiliza cliente atual e substitui cliente antigo após regeneração", () => {
  let creations = 0;
  let disconnections = 0;
  // Prisma returns a proxy; constructor identity must be tracked separately.
  function CurrentClient() {
    creations++;
    return { $disconnect: async () => {} };
  }
  const shared = {
    prisma: {
      $disconnect: async () => {
        disconnections++;
      },
    },
    prismaConstructor: function OldClient() {},
  };
  const dependencies = {
    "@prisma/adapter-pg": { PrismaPg: class {} },
    "@/generated/prisma/client": { PrismaClient: CurrentClient },
  };
  const globals = {
    globalThis: shared,
    process: {
      env: {
        NODE_ENV: "development",
        DATABASE_URL: "postgresql://localhost/test",
      },
    },
  };
  const first = loadServerModule("lib/db.ts", dependencies, globals).prisma;
  assert.equal(creations, 1);
  assert.equal(disconnections, 1);
  assert.equal(shared.prisma, first);
  const second = loadServerModule("lib/db.ts", dependencies, globals).prisma;
  assert.equal(second, first);
  assert.equal(creations, 1);
});

const documents = loadServerModule("lib/document.ts", {
  "./cpf": loadServerModule("lib/cpf.ts", {}),
});

test("documentos validam CPF, CNPJ numérico e CNPJ alfanumérico com dígitos verificadores", () => {
  for (const value of [
    "529.982.247-25",
    "52998224725",
    "04.252.011/0001-10",
    "04252011000110",
    "00.000.000/E08G-12",
    "00000000e08g12",
  ]) {
    assert.equal(documents.validateDocument(value), true, value);
  }
  for (const value of [
    "",
    "00000000000",
    "11111111111111",
    "52998224726",
    "04252011000111",
    "00000000E08G13",
    "00000000E08GAA",
    "TEMP-ABC",
    "52998224725!",
    "123",
  ]) {
    assert.equal(documents.validateDocument(value), false, value);
  }
});

test("máscaras aceitam digitação incremental e preservam letras de CNPJ e códigos legados", () => {
  for (const raw of ["52998224725", "04252011000110", "00000000E08G12"]) {
    let draft = "";
    for (const character of raw)
      draft = documents.maskDocumentIncremental(draft + character);
    assert.equal(documents.normalizeDocument(draft), raw);
    assert.equal(draft, documents.formatDocument(raw));
  }
  assert.equal(
    documents.formatDocument("00000000E08G12"),
    "00.000.000/E08G-12",
  );
  assert.equal(
    documents.formatDocument("TEMP-TESTAUGE000000001"),
    "TEMP-TESTAUGE000000001",
  );
  assert.equal(
    documents.maskDocumentIncremental("TEMP-TESTAUGE000000001"),
    "TEMP-TESTAUGE000000001",
  );
});

test("cadastro aceita CNPJ e edição preserva TEMP sem autorizar novo cadastro com código temporário", () => {
  const schemas = loadServerModule("validators/customer-schema.ts", {
    "@/lib/document": documents,
  });
  const values = {
    chassis: "ABC",
    document: "00.000.000/E08G-12",
    customerName: "Cliente",
    sellerName: "Vendedor",
    city: "Cidade",
    model: "Moto",
    arrivalStatus: "Sem Informação",
    registrationStatus: "Sem Emplacamento",
  };
  assert.equal(schemas.customerSchema.parse(values).document, "00000000E08G12");
  const legacy = { ...values, document: "TEMP-TESTAUGE000000001" };
  assert.equal(schemas.customerSchema.safeParse(legacy).success, false);
  assert.equal(
    schemas.editCustomerSchema.parse(legacy).document,
    legacy.document,
  );
  const alias = documents.withDocumentAlias({
    ...values,
    document: undefined,
    cpf: "529.982.247-25",
  });
  assert.equal(schemas.customerSchema.parse(alias).document, "52998224725");
});

test("busca BDC encontra CPF com pontuação e preserva consultas por nome e chassi", async () => {
  let filter;
  let queryCalls = 0;
  const document = loadServerModule("lib/document.ts", {
    "./cpf": loadServerModule("lib/cpf.ts", {}),
  });
  const queries = loadServerModule("lib/data/clients/client-queries.ts", {
    "next/cache": {},
    "@/lib/arrival": {},
    "@/lib/document": document,
    "@/lib/data/arrival-status": {},
    "@/lib/data/listing-cache-tags": {},
    "@/lib/db": {
      prisma: {
        client: {
          findMany: async ({ where }) => {
            queryCalls++;
            filter = where;
            return [];
          },
          count: async () => 0,
        },
      },
    },
  });
  for (const search of ["624.468.573-37", "62446857337", " 624.468.573-37 "]) {
    await queries.getClientsPaginated({ page: 1, pageSize: 20, search });
    assert.equal(filter.OR[1].document.contains, "62446857337");
  }
  for (const search of ["00.000.000/E08G-12", "00000000e08g12"]) {
    await queries.getClientsPaginated({ page: 1, pageSize: 20, search });
    assert.equal(filter.OR[1].document.contains, "00000000E08G12");
    await queries.searchClients(search);
    assert.equal(filter.document.equals, "00000000E08G12");
  }
  for (const search of ["Maria", "9C2KC2500TR102752"]) {
    await queries.getClientsPaginated({ page: 1, pageSize: 20, search });
    assert.equal(filter.OR[0].name.contains, search);
    assert.equal(filter.OR[1].document.contains, search.toUpperCase());
    assert.equal(filter.OR[2].motorcycles.some.chassi.contains, search);
  }
  const before = queryCalls;
  for (const invalid of ["", "529982", "TEMP-ABC", "52998224726"]) {
    assert.equal((await queries.searchClients(invalid)).length, 0);
  }
  assert.equal(queryCalls, before);
});

test("filtros BDC mantêm motos e contadores coerentes em clientes com chegadas mistas", async () => {
  const arrival = loadServerModule("lib/arrival.ts", {});
  const arrivalWhere = loadServerModule("lib/data/arrival-status.ts", {
    "@/lib/arrival": arrival,
  });
  const clients = [
    {
      id: "mixed",
      name: "Maria",
      document: "52998224725",
      sellersName: "Ana",
      city: "Natal",
      motorcycles: [
        {
          chassi: "RECEIVED",
          model: "CG",
          forecastArrivalStatus: "ARRIVED",
          arrivedAt: null,
          forecastArrival: new Date("2020-01-01"),
        },
        {
          chassi: "LATE",
          model: "Biz",
          forecastArrivalStatus: "NO_INFORMATION",
          arrivedAt: null,
          forecastArrival: new Date("2020-01-01"),
        },
        {
          chassi: "FUTURE",
          model: "CG",
          forecastArrivalStatus: "NO_INFORMATION",
          arrivedAt: null,
          forecastArrival: new Date("2099-01-01"),
        },
      ],
    },
    {
      id: "similar",
      name: "Outra",
      document: "04252011000110",
      sellersName: "Mariana",
      city: "Natalândia",
      motorcycles: [
        {
          chassi: "OTHER",
          model: "CG 160",
          forecastArrivalStatus: "NO_INFORMATION",
          arrivedAt: null,
          forecastArrival: null,
        },
      ],
    },
    {
      id: "empty",
      name: "Sem moto",
      document: "",
      sellersName: "Ana",
      city: "Natal",
      motorcycles: [],
    },
  ];
  // Evaluate the Prisma predicates against fixtures to check observable results.
  function matches(record, where = {}) {
    return Object.entries(where).every(([key, condition]) => {
      if (key === "AND")
        return condition.every((item) => matches(record, item));
      if (key === "OR") return condition.some((item) => matches(record, item));
      if (key === "NOT") return !matches(record, condition);
      if (key === "motorcycles")
        return record.motorcycles.some((moto) =>
          matches({ ...moto, client: record }, condition.some),
        );
      if (key === "client") return matches(record.client, condition.is);
      const value = record[key];
      if (condition === null || typeof condition !== "object")
        return value === condition;
      if ("not" in condition) return value !== condition.not;
      if ("lt" in condition) return value !== null && value < condition.lt;
      const actual = String(value).toLowerCase();
      if ("equals" in condition)
        return actual === condition.equals.toLowerCase();
      if ("contains" in condition)
        return actual.includes(condition.contains.toLowerCase());
      throw new Error(`Unsupported predicate: ${key}`);
    });
  }
  const queries = loadServerModule("lib/data/clients/client-queries.ts", {
    "next/cache": { cacheLife() {}, cacheTag() {} },
    "@/lib/arrival": arrival,
    "@/lib/document": documents,
    "@/lib/data/arrival-status": arrivalWhere,
    "@/lib/data/listing-cache-tags": { listingCacheTags: {} },
    "@/lib/db": {
      prisma: {
        client: {
          count: async ({ where }) =>
            clients.filter((client) => matches(client, where)).length,
          findMany: async ({ where, select, skip, take }) =>
            clients
              .filter((client) => matches(client, where))
              .slice(skip, skip + take)
              .map((client) => ({
                ...client,
                motorcycles: client.motorcycles.filter((moto) =>
                  matches({ ...moto, client }, select.motorcycles.where),
                ),
              })),
        },
      },
    },
  });
  const list = (filters) =>
    queries.getClientsPaginated({ page: 1, pageSize: 20, ...filters });
  const chassis = (result) =>
    Array.from(
      result.clients.flatMap((client) =>
        client.motorcycles.map((moto) => moto.chassi),
      ),
    );
  assert.deepEqual(
    chassis(await list({ sellerName: "Ana", arrived: "false" })),
    ["LATE", "FUTURE"],
  );
  assert.deepEqual(chassis(await list({ arrived: "delayed" })), ["LATE"]);
  assert.deepEqual(chassis(await list({ arrived: "true" })), ["RECEIVED"]);
  assert.deepEqual(chassis(await list({ model: "CG" })), [
    "RECEIVED",
    "FUTURE",
  ]);
  assert.equal((await list({ city: "Natal" })).total, 2);
  assert.deepEqual(
    chassis(await list({ search: "RECEIVED", arrived: "false" })),
    [],
  );
  assert.deepEqual(chassis(await list({ search: "LATE", model: "CG" })), []);
  assert.deepEqual(chassis(await list({ search: "LATE" })), ["LATE"]);
  assert.deepEqual(
    chassis(await list({ search: "529.982.247-25", arrived: "false" })),
    ["LATE", "FUTURE"],
  );
  const counts = await queries.getBDCStatusCounts({
    model: "CG",
    arrived: "delayed",
  });
  assert.equal(counts.total, 1);
  assert.equal(counts.arrived, 1);
  assert.equal(counts.waiting, 1);
  assert.equal(counts.delayed, 0);
  assert.equal(
    (await list({ sellerName: "Ana", arrived: "false", page: 2, pageSize: 1 }))
      .clients.length,
    0,
  );
});

test("importação preserva CNPJ alfanumérico, CPF e TEMP existentes; documento inválido é ignorado", async () => {
  const clients = [
    { id: "cpf", document: "52998224725", billingDate: null },
    { id: "legacy", document: "TEMP-LEGACY", billingDate: null },
  ];
  const motorcycles = [
    { id: "legacy-moto", chassi: "LEGACY", model: "Moto", clientId: "legacy" },
  ];
  const createdClients = [];
  const tx = {
    client: {
      findMany: async () => clients,
      create: async ({ data }) => {
        const client = { id: `new-${createdClients.length}`, ...data };
        createdClients.push(client);
        return client;
      },
    },
    motorcycle: {
      findMany: async () => motorcycles,
      create: async ({ data }) => ({ id: "new-moto", ...data }),
    },
  };
  const dal = loadServerModule("lib/data/clients/bdc-spreadsheet-import.ts", {
    "@/lib/document": documents,
    "@/lib/db": { prisma: { $transaction: (callback) => callback(tx) } },
  });
  const row = {
    cliente: "Cliente",
    consultor: "Vendedor",
    modelo: "Moto",
    cidade: "Cidade",
    faturamento: null,
  };
  const result = await dal.importBDCSpreadsheet([
    { ...row, chassi: "CNPJ", document: "00.000.000/e08g-12" },
    { ...row, chassi: "CPF", document: "529.982.247-25" },
    { ...row, chassi: "LEGACY", document: "" },
    { ...row, chassi: "INVALID", document: "04252011000111" },
  ]);
  assert.equal(createdClients.length, 1);
  assert.equal(createdClients[0].document, "00000000E08G12");
  assert.equal(clients[0].document, "52998224725");
  assert.equal(clients[1].document, "TEMP-LEGACY");
  assert.equal(result.created, 2);
  assert.equal(result.skipped, 2); // Invalid document and unchanged legacy row.
});

test("edição impede TEMP diferente e documento duplicado sem alterar cliente ou moto", async () => {
  let writes = 0;
  let duplicate = false;
  const tx = {
    client: {
      findUnique: async () => ({
        id: "client",
        document: "TEMP-ORIGINAL",
        motorcycles: [],
      }),
      findFirst: async () => (duplicate ? { id: "other" } : null),
      update: async () => {
        writes++;
      },
    },
  };
  const dal = loadServerModule("lib/data/clients/bdc-mutations.ts", {
    "@/lib/document": documents,
    "@/lib/db": { prisma: { $transaction: (callback) => callback(tx) } },
    "@/lib/data/record-staff-arrival": {},
  });
  assert.ok(
    await dal.updateBDCClient({ clientId: "client", document: "TEMP-OTHER" }),
  );
  duplicate = true;
  assert.ok(
    await dal.updateBDCClient({
      clientId: "client",
      document: "00000000E08G12",
    }),
  );
  assert.equal(writes, 0);
});

test("BDC salva status e data na moto selecionada e em moto existente no cadastro", async () => {
  const writes = [];
  const motorcycle = { id: "moto", chassi: "ABC", clientId: "client" };
  const tx = {
    client: {
      findUnique: async () => ({ id: "client", motorcycles: [motorcycle] }),
      findFirst: async () => null,
      update: async () => ({}),
    },
    motorcycle: {
      findUnique: async () => motorcycle,
      update: async (query) => {
        writes.push(query);
        return motorcycle;
      },
    },
  };
  const dal = loadServerModule("lib/data/clients/bdc-mutations.ts", {
    "@/lib/document": loadServerModule("lib/document.ts", {
      "./cpf": loadServerModule("lib/cpf.ts", {}),
    }),
    "@/lib/db": { prisma: { $transaction: (callback) => callback(tx) } },
    "@/lib/data/record-staff-arrival": { recordStaffArrival: async () => {} },
  });
  const date = new Date("2026-10-14T12:00:00Z");
  const input = {
    clientId: "client",
    motorcycleId: "moto",
    document: "52998224725",
    name: "Cliente",
    sellerName: "Vendedor",
    city: "Cidade",
    motorcycle: {
      chassis: "ABC",
      model: "Moto",
      arrivalStatus: "NO_INFORMATION",
      registrationStatus: "PLATED",
      registrationDate: date,
    },
  };
  assert.equal(await dal.updateBDCClient(input), null);
  await dal.createBDCClient(input);
  assert.equal(writes.length, 2);
  for (const write of writes) {
    assert.equal(write.where.id, "moto");
    assert.equal(write.data.registrationStatus, "PLATED");
    assert.equal(write.data.registrationDate, date);
  }
  writes.length = 0;
  await dal.updateBDCClient({
    ...input,
    motorcycle: {
      ...input.motorcycle,
      registrationStatus: "NO_PLATE",
      registrationDate: undefined,
    },
  });
  assert.equal(writes[0].data.registrationDate, null);
});

test("BDC exige data de emplacamento e normaliza a data REST antes de salvar", async () => {
  const document = loadServerModule("lib/document.ts", {
    "./cpf": loadServerModule("lib/cpf.ts", {}),
  });
  const { editCustomerSchema } = loadServerModule(
    "validators/customer-schema.ts",
    {
      "@/lib/document": document,
    },
  );
  const status = loadServerModule("lib/bdc-status.ts", {});
  let saved;
  const service = loadServerModule("lib/services/bdc/client.ts", {
    "@/lib/services/revalidate-motorcycle-pages": {
      revalidateMotorcyclePages() {},
    },
    "@/lib/document": document,
    "next/cache": { revalidatePath() {} },
    "@/lib/api/revalidate-listing-cache": { revalidateListingCache() {} },
    "@/lib/bdc-status": status,
    "@/lib/data/client": {
      updateBDCClient: async (input) => {
        saved = input;
        return null;
      },
    },
    "@/lib/server/mutation-result": loadServerModule(
      "lib/server/mutation-result.ts",
      {},
    ),
    "@/lib/server/normalize-date-fields": loadServerModule(
      "lib/server/normalize-date-fields.ts",
      {},
    ),
    "@/validators/customer-schema": { editCustomerSchema },
  });
  const id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const actor = { user: { id: "user", name: "Admin" }, transport: "route" };
  const values = {
    chassis: "ABC",
    document: "52998224725",
    customerName: "Cliente",
    sellerName: "Vendedor",
    city: "Cidade",
    model: "Moto",
    arrivalStatus: "Sem Informação",
    registrationStatus: "Emplacado",
  };
  assert.equal(
    (await service.updateClient({ motorcycleId: id, values }, actor, id))
      .statusCode,
    400,
  );
  assert.equal(saved, undefined);
  const result = await service.updateClient(
    {
      motorcycleId: id,
      values: { ...values, registrationDate: "2026-10-14T12:00:00Z" },
    },
    actor,
    id,
  );
  assert.equal(result.statusCode, 200);
  assert.equal(saved.motorcycle.registrationStatus, "PLATED");
  assert.equal(
    saved.motorcycle.registrationDate.toISOString(),
    "2026-10-14T12:00:00.000Z",
  );
  await service.updateClient(
    {
      motorcycleId: id,
      values: {
        ...values,
        registrationStatus: "Sem Emplacamento",
        registrationDate: "2026-10-14T12:00:00Z",
      },
    },
    actor,
    id,
  );
  assert.equal(saved.motorcycle.registrationDate, undefined);
});

test("excluir cliente removido em outra sessão retorna 404 e atualiza as listagens", async () => {
  let count = 1;
  let invalidations = 0;
  const dal = loadServerModule("lib/data/clients/client-mutations.ts", {
    "@/lib/document": documents,
    "@/lib/db": { prisma: { client: { deleteMany: async () => ({ count }) } } },
  });
  const service = loadServerModule("lib/services/bdc/client.ts", {
    "@/lib/services/revalidate-motorcycle-pages": {
      revalidateMotorcyclePages() {
        invalidations++;
      },
    },
    "@/lib/bdc-status": {},
    "@/lib/data/client": dal,
    "@/lib/document": documents,
    "@/lib/server/mutation-result": loadServerModule(
      "lib/server/mutation-result.ts",
      {},
    ),
    "@/lib/server/normalize-date-fields": {},
    "@/validators/customer-schema": {},
  });
  const id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const actor = { user: { id: "user" }, transport: "action" };
  assert.equal(
    (await service.removeClient(undefined, actor, id)).statusCode,
    200,
  );
  count = 0;
  const missing = await service.removeClient(undefined, actor, id);
  assert.equal(missing.statusCode, 404);
  assert.ok(missing.message.includes("outra sessão"));
  assert.equal(invalidations, 2);
});

test("Server Action mantém código 404 para a interface exibir recurso não encontrado", async () => {
  const harness = actionHarness();
  const result = await harness.run({
    execute: async () => ({
      statusCode: 404,
      message: "Registro não encontrado.",
    }),
  });
  assert.equal(result.status, "error");
  assert.equal(result.statusCode, 404);
});

// Exercise the actual server modules with injected dependencies, without Next's
// request runtime or a database. No mutation is executed against real data.
function loadServerModule(path, dependencies, globals = {}) {
  const { outputText } = ts.transpileModule(
    readFileSync(new URL(`../${path}`, import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  );
  const module = { exports: {} };
  runInNewContext(outputText, {
    exports: module.exports,
    module,
    require: (name) =>
      name === "server-only" ? {} : (dependencies[name] ?? require(name)),
    TextEncoder,
    Date,
    Response,
    Request,
    console: { error() {} },
    ...globals,
  });
  return module.exports;
}

function actionHarness({
  role = "USER",
  session = true,
  limited = false,
} = {}) {
  let executions = 0;
  let rateChecks = 0;
  const { runActionMutation } = loadServerModule(
    "lib/server/action-mutation.ts",
    {
      "next/headers": { headers: async () => new Headers() },
      "@/lib/auth": {
        auth: {
          api: {
            getSession: async () =>
              session ? { user: { id: "actual-user", role } } : null,
          },
        },
      },
      "@/lib/api/auth": {
        checkMutationRateLimit: async () => {
          rateChecks++;
          return limited ? new Response(null, { status: 429 }) : null;
        },
      },
    },
  );
  return {
    run: (options) =>
      runActionMutation({
        scope: "/api/v1/test",
        method: "POST",
        execute: async (actor) => {
          executions++;
          return {
            statusCode: 200,
            message: actor.user.id,
            data: actor.transport,
          };
        },
        ...options,
      }),
    executions: () => executions,
    rateChecks: () => rateChecks,
  };
}

test("actions reject missing sessions before rate checks and mutations", async () => {
  const harness = actionHarness({ session: false });
  assert.equal((await harness.run()).status, "error");
  assert.equal(harness.executions(), 0);
  assert.equal(harness.rateChecks(), 0);
});

test("untrusted role in input cannot grant admin permissions", async () => {
  const harness = actionHarness();
  assert.equal(
    (await harness.run({ roles: ["ADMIN"], input: { role: "ADMIN" } })).status,
    "error",
  );
  assert.equal(harness.executions(), 0);
});

test("rate limits prevent the command from executing", async () => {
  const harness = actionHarness({ limited: true });
  assert.equal((await harness.run()).status, "error");
  assert.equal(harness.executions(), 0);
});

test("ordinary actions reject oversized payloads before execution", async () => {
  const harness = actionHarness();
  assert.equal(
    (await harness.run({ input: "x".repeat(65 * 1024) })).status,
    "error",
  );
  assert.equal(harness.executions(), 0);
});

test("imports have a separate payload budget", async () => {
  const harness = actionHarness();
  assert.equal(
    (await harness.run({ import: true, input: "x".repeat(65 * 1024) })).status,
    "success",
  );
  assert.equal(
    (await harness.run({ import: true, input: "x".repeat(5 * 1024 * 1024) }))
      .status,
    "error",
  );
  assert.equal(harness.executions(), 1);
});

test("actions derive actor identity from the session and normalize domain failures", async () => {
  const harness = actionHarness({ role: "ADMIN" });
  const result = await harness.run({
    input: { userId: "spoofed" },
    roles: ["ADMIN"],
  });
  assert.equal(result.message, "actual-user");
  assert.equal(result.data, "action");
  const failed = await harness.run({
    execute: async () => ({ statusCode: 409, message: "duplicate" }),
  });
  assert.equal(failed.status, "error");
});

test("unexpected action errors return a safe message", async () => {
  const harness = actionHarness();
  const result = await harness.run({
    execute: async () => {
      throw new Error("secret connection string");
    },
  });
  assert.equal(result.status, "error");
  assert.ok(!result.message.includes("secret"));
});

test("REST mutations stop on an origin violation", async () => {
  let authorizations = 0;
  const { runApiMutation } = loadServerModule("lib/server/api-mutation.ts", {
    "@/lib/api/auth": {
      assertSameOrigin: () => new Response(null, { status: 403 }),
      authorizeApiRequest: async () => {
        authorizations++;
      },
    },
  });
  const response = await runApiMutation(
    new Request("http://localhost/api", { method: "POST" }),
    {
      execute: () => {
        throw new Error("must not execute");
      },
    },
  );
  assert.equal(response.status, 403);
  assert.equal(authorizations, 0);
});

test("REST preserves domain HTTP status and error shape", async () => {
  const { runApiMutation } = loadServerModule("lib/server/api-mutation.ts", {
    "@/lib/api/auth": {
      assertSameOrigin: () => null,
      authorizeApiRequest: async () => ({ session: { user: { id: "owner" } } }),
      readJsonBody: async () => ({}),
    },
  });
  const response = await runApiMutation(
    new Request("http://localhost/api", { method: "POST" }),
    { execute: async () => ({ statusCode: 409, message: "duplicate" }) },
  );
  assert.equal(response.status, 409);
  assert.deepEqual(await response.json(), { error: "duplicate" });
});

test("only ticket owners and admins may reply", async () => {
  let messages = 0;
  const { replyToTicket } = loadServerModule("lib/services/support/ticket.ts", {
    "@/validators/reply-ticket-schema": loadServerModule(
      "validators/reply-ticket-schema.ts",
      {},
    ),
    "next/cache": { revalidatePath() {} },
    "@/lib/server/mutation-result": {
      mutationError: (message, statusCode) => ({ message, statusCode }),
      mutationSuccess: (body) => ({ ...body, statusCode: 200 }),
    },
    "@/lib/data/ticket": {
      getTicketOwnerId: async () => ({ createdById: "owner" }),
      createTicketMessage: async () => {
        messages++;
      },
    },
  });
  const id = "ab4763f4-8776-4c85-a953-7851440ce5d0";
  assert.equal(
    (
      await replyToTicket(
        { message: "hello" },
        { user: { id: "stranger", role: "USER" } },
        id,
      )
    ).statusCode,
    403,
  );
  assert.equal(messages, 0);
  assert.equal(
    (
      await replyToTicket(
        { message: "hello" },
        { user: { id: "owner", role: "USER" } },
        id,
      )
    ).statusCode,
    200,
  );
  assert.equal(
    (
      await replyToTicket(
        { message: "hello" },
        { user: { id: "admin", role: "ADMIN" } },
        id,
      )
    ).statusCode,
    200,
  );
  assert.equal(messages, 2);
});

test("action cache invalidation uses updateTag; REST expires tags", () => {
  const calls = [];
  const { revalidateListingCache } = loadServerModule(
    "lib/api/revalidate-listing-cache.ts",
    {
      "next/cache": {
        updateTag: (tag) => calls.push(["action", tag]),
        revalidateTag: (tag, profile) =>
          calls.push(["route", tag, profile.expire]),
      },
      "@/lib/data/listing-cache-tags": {
        listingCacheTags: { inventory: "inventory", bdc: "bdc" },
      },
    },
  );
  revalidateListingCache("action");
  revalidateListingCache("route");
  assert.deepEqual(calls, [
    ["action", "inventory"],
    ["action", "bdc"],
    ["route", "inventory", 0],
    ["route", "bdc", 0],
  ]);
});
