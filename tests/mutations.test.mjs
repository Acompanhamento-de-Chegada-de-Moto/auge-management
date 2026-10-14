import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);

test("busca BDC encontra CPF com pontuação e preserva consultas por nome e chassi", async () => {
  let filter;
  const cpf = loadServerModule("lib/cpf.ts", {});
  const queries = loadServerModule("lib/data/clients/client-queries.ts", {
    "next/cache": {},
    "@/lib/arrival": {},
    "@/lib/cpf": cpf,
    "@/lib/data/arrival-status": {},
    "@/lib/data/listing-cache-tags": {},
    "@/lib/db": {
      prisma: {
        client: {
          findMany: async ({ where }) => {
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
    assert.equal(filter.OR[1].cpf.contains, "62446857337");
  }
  for (const search of ["Maria", "9C2KC2500TR102752"]) {
    await queries.getClientsPaginated({ page: 1, pageSize: 20, search });
    assert.equal(filter.OR[0].name.contains, search);
    assert.equal(filter.OR[1].cpf.contains, search);
    assert.equal(filter.OR[2].motorcycles.some.chassi.contains, search);
  }
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
    "@/lib/db": { prisma: { $transaction: (callback) => callback(tx) } },
    "@/lib/data/record-staff-arrival": { recordStaffArrival: async () => {} },
  });
  const date = new Date("2026-10-14T12:00:00Z");
  const input = {
    clientId: "client",
    motorcycleId: "moto",
    cpf: "52998224725",
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
  const cpf = loadServerModule("lib/cpf.ts", {});
  const { customerSchema } = loadServerModule("validators/customer-schema.ts", {
    "@/lib/cpf": cpf,
  });
  const status = loadServerModule("lib/bdc-status.ts", {});
  let saved;
  const service = loadServerModule("lib/services/bdc/client.ts", {
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
    "@/validators/customer-schema": { customerSchema },
  });
  const id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const actor = { user: { id: "user", name: "Admin" }, transport: "route" };
  const values = {
    chassis: "ABC",
    cpf: "52998224725",
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

// Exercise the actual server modules with injected dependencies, without Next's
// request runtime or a database. No mutation is executed against real data.
function loadServerModule(path, dependencies) {
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
