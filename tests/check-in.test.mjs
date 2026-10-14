import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
function load(path, dependencies = {}) {
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
    Date,
    Intl,
    Buffer,
    TextEncoder,
    Response,
    process,
    console,
  });
  return module.exports;
}
const arrival = load("lib/arrival.ts");
const schemas = load("lib/check-in/schemas.ts");
const credentials = load("lib/check-in/credentials.ts");
const where = load("lib/data/arrival-status.ts", { "@/lib/arrival": arrival });

test("check-in aceita conta existente, rejeita usuário banido e prioriza o PIN ativo", async () => {
  let operator = null;
  let staff = null;
  const access = load("lib/check-in/access.ts", {
    "next/headers": { headers: async () => new Headers() },
    "@/lib/auth": { auth: { api: { getSession: async () => staff } } },
    "./session": { getCheckInSession: async () => operator },
  });
  assert.equal(await access.getCheckInAccess(), null);
  staff = {
    user: { id: "user", name: "Maria", banned: false },
    session: { id: "staff-session", expiresAt: new Date(Date.now() + 10000) },
  };
  let result = await access.getCheckInAccess();
  assert.equal(result.kind, "staff");
  assert.equal(result.id, "user");
  staff.user.banned = true;
  assert.equal(await access.getCheckInAccess(), null);
  operator = {
    id: "pin-session",
    operatorId: "operator",
    operator: { name: "João" },
    expiresAt: new Date(Date.now() + 10000),
  };
  result = await access.getCheckInAccess();
  assert.equal(result.kind, "operator");
  assert.equal(result.id, "operator");
});

test("nome de operador aceita espaços e homônimos não selecionam credenciais arbitrárias", async () => {
  assert.equal(
    schemas.operatorSchema.safeParse({ name: "Maria Silva" }).success,
    true,
  );
  assert.equal(
    schemas.pinLoginSchema.parse({
      identifier: " Maria Silva ",
      pin: "12345678",
    }).identifier,
    "maria silva",
  );
  let operators = [{ id: "one" }];
  const dal = load("lib/data/check-in.ts", {
    "@/lib/db": {
      prisma: { checkInOperator: { findMany: async () => operators } },
    },
    "./arrival-status": where,
  });
  assert.equal((await dal.findCheckInOperator("maria silva")).id, "one");
  operators = [{ id: "one" }, { id: "two" }];
  assert.equal(await dal.findCheckInOperator("maria silva"), null);
});

test("recebimento por conta revalida sessão na transação e registra o usuário", async () => {
  let authorized = true;
  let received = null;
  const service = load("lib/services/check-in/receive.ts", {
    "@/lib/db": {
      prisma: {
        $transaction: (callback) =>
          callback({
            $queryRaw: async () => (authorized ? [{ name: "Maria" }] : []),
          }),
      },
    },
    "@/lib/data/check-in": {
      receiveMotorcycle: async (_tx, input) => {
        received = input;
        return { id: "moto" };
      },
    },
  });
  const input = {
    motorcycleId: "moto",
    chassi: "ABC",
    source: "QR_CODE",
    sessionId: "s",
    userId: "user",
  };
  assert.equal((await service.receiveStaffCheckInMotorcycle(input)).id, "moto");
  assert.equal(received.operatorId, null);
  assert.equal(received.actorLabel, "Maria (user)");
  assert.equal(received.source, "QR_CODE");
  authorized = false;
  received = null;
  assert.equal(await service.receiveStaffCheckInMotorcycle(input), null);
  assert.equal(received, null);
});

test("QR aceita JSON com chassi e texto puro, normalizando o valor", () => {
  for (const value of [
    ' {"chassi":" testauge000000003 "} ',
    '{"chassi":"testauge000000003","modelo":"Moto"}',
    " testauge000000003 ",
  ]) {
    const result = schemas.qrChassisSchema.safeParse(value);
    assert.equal(result.success, true);
    assert.equal(result.data.chassi, "TESTAUGE000000003");
  }
});

test("etiqueta real do fornecedor contém chassi em texto com espaços finais", () => {
  const result = schemas.qrChassisSchema.safeParse(
    "9C2KC2500TR102752            ",
  );
  assert.equal(result.success, true);
  assert.equal(result.data.chassi, "9C2KC2500TR102752");
});

test("QR rejeita JSON malformado, chassi ausente e valores inválidos", () => {
  for (const value of [
    '{"chassi":',
    "{}",
    '{"chassi":123}',
    '{"chassi":null}',
    '{"chassi":""}',
    '{"chassi":"TEST AUGE"}',
    '{"chassi":"https://example.com"}',
    '[{"chassi":"TESTAUGE000000003"}]',
    "https://example.com",
    "A".repeat(18),
    " ",
    `{"chassi":"TESTAUGE000000003","extra":"${"A".repeat(4096)}"}`,
  ]) {
    assert.equal(schemas.qrChassisSchema.safeParse(value).success, false);
  }
});

test("excluir operador exige ADMIN, valida UUID e trata cadastro inexistente", async () => {
  let role = "USER";
  let deletions = 0;
  let count = 1;
  const runAction = load("lib/server/action-mutation.ts", {
    "next/headers": { headers: async () => new Headers() },
    "@/lib/auth": {
      auth: {
        api: {
          getSession: async () =>
            role ? { user: { id: "admin", role } } : null,
        },
      },
    },
    "@/lib/api/auth": { checkMutationRateLimit: async () => null },
  });
  const actions = load("app/(app)/squad/check-in/_actions/operators.ts", {
    "next/cache": { revalidatePath() {} },
    "@/lib/check-in/credentials": credentials,
    "@/lib/check-in/schemas": schemas,
    "@/lib/data/check-in": {
      deleteCheckInOperator: async () => {
        deletions++;
        return { count };
      },
    },
    "@/lib/server/action-mutation": runAction,
    "@/lib/server/mutation-result": load("lib/server/mutation-result.ts"),
  });
  const id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  assert.equal((await actions.deleteOperatorAction(id)).status, "error");
  role = null;
  assert.equal((await actions.deleteOperatorAction(id)).status, "error");
  assert.equal(deletions, 0);
  role = "ADMIN";
  assert.equal((await actions.deleteOperatorAction("invalid")).status, "error");
  assert.equal(deletions, 0);
  assert.equal((await actions.deleteOperatorAction(id)).status, "success");
  count = 0;
  assert.equal((await actions.deleteOperatorAction(id)).status, "error");
  assert.equal(deletions, 2);
});

test("a previsão vale até 23:59:59 em São Paulo e vence à meia-noite", () => {
  const motorcycle = {
    forecastArrival: new Date("2026-10-10T03:00:00Z"),
    forecastArrivalStatus: "NO_INFORMATION",
    arrivedAt: null,
  };
  assert.equal(
    arrival.effectiveArrivalStatus(
      motorcycle,
      new Date("2026-10-11T02:59:59.999Z"),
    ),
    "NO_INFORMATION",
  );
  assert.equal(
    arrival.effectiveArrivalStatus(
      motorcycle,
      new Date("2026-10-11T03:00:00Z"),
    ),
    "DELAYED",
  );
  assert.equal(
    arrival.businessDate(new Date("2026-10-11T02:59:59Z")),
    "2026-10-10",
  );
});
test("recebida nunca atrasa; ausência de previsão nunca gera atraso", () => {
  const now = new Date("2026-10-11T03:00:00Z");
  assert.equal(
    arrival.effectiveArrivalStatus(
      { forecastArrival: null, forecastArrivalStatus: "DELAYED" },
      now,
    ),
    "NO_INFORMATION",
  );
  assert.equal(
    arrival.effectiveArrivalStatus(
      {
        forecastArrival: new Date("2026-10-01"),
        forecastArrivalStatus: "ARRIVED",
      },
      now,
    ),
    "ARRIVED",
  );
  assert.equal(
    arrival.effectiveArrivalStatus(
      {
        forecastArrival: new Date("2026-10-01"),
        forecastArrivalStatus: "DELAYED",
        arrivedAt: now,
      },
      now,
    ),
    "ARRIVED",
  );
});
test("reagendar uma moto ainda não recebida remove o atraso efetivo", () => {
  assert.equal(
    arrival.effectiveArrivalStatus(
      {
        forecastArrival: new Date("2026-10-15"),
        forecastArrivalStatus: "DELAYED",
      },
      new Date("2026-10-11T03:00:00Z"),
    ),
    "NO_INFORMATION",
  );
});
test("PINs têm 8 dígitos; hashes usam sal e rejeitam PIN errado", async () => {
  assert.match(credentials.generatePin(), /^\d{8}$/);
  const first = await credentials.hashPin("00123456");
  const second = await credentials.hashPin("00123456");
  assert.notEqual(first, second);
  assert.equal(await credentials.verifyPin("00123456", first), true);
  assert.equal(await credentials.verifyPin("00123457", first), false);
  assert.equal(await credentials.verifyPin("00123456", "corrupt"), false);
});
test("QR aceita somente chassi, nunca URLs ou payloads arbitrários", () => {
  assert.equal(
    schemas.chassisSchema.parse({ chassi: " abc123 " }).chassi,
    "ABC123",
  );
  for (const chassi of ["https://example.com", "<script>", "A".repeat(18), ""])
    assert.equal(schemas.chassisSchema.safeParse({ chassi }).success, false);
  assert.equal(
    schemas.confirmationSchema.safeParse({
      motorcycleId: "bad",
      chassi: "ABC",
      source: "QR_CODE",
    }).success,
    false,
  );
});
test("sessões ausentes, expiradas ou revogadas não autorizam o operador", async () => {
  let token;
  let session;
  let queries = 0;
  const api = load("lib/check-in/session.ts", {
    "next/headers": {
      cookies: async () => ({
        get: () => (token ? { value: token } : undefined),
      }),
    },
    "@/lib/check-in/credentials": credentials,
    "./credentials": credentials,
    "@/lib/data/check-in": {
      findCheckInSession: async () => {
        queries++;
        return session;
      },
    },
  });
  assert.equal(await api.getCheckInSession(), null);
  token = "forged";
  assert.equal(await api.getCheckInSession(), null);
  assert.equal(queries, 0);
  token = credentials.generateToken();
  session = {
    operator: { active: true },
    expiresAt: new Date(Date.now() - 1000),
  };
  assert.equal(await api.getCheckInSession(), null);
  session = {
    operator: { active: false },
    expiresAt: new Date(Date.now() + 10000),
  };
  assert.equal(await api.getCheckInSession(), null);
  session.operator.active = true;
  assert.equal(await api.getCheckInSession(), session);
});
test("confirmações concorrentes geram um único recibo e preservam o primeiro horário", async () => {
  let record = {
    id: "moto",
    chassi: "ABC",
    forecastArrivalStatus: "DELAYED",
    arrivedAt: null,
  };
  let receipts = 0;
  const tx = {
    $queryRaw: async () => [{ name: "Operador" }],
    motorcycle: {
      updateMany: async ({ where: condition, data }) => {
        assert.equal(condition.forecastArrivalStatus.not, "ARRIVED");
        if (record.arrivedAt || record.forecastArrivalStatus === "ARRIVED")
          return { count: 0 };
        record = { ...record, ...data };
        return { count: 1 };
      },
      findFirst: async () => record,
    },
    motorcycleReceipt: {
      create: async () => {
        receipts++;
      },
    },
  };
  const dal = load("lib/data/check-in.ts", {
    "@/lib/db": { prisma: { $transaction: (callback) => callback(tx) } },
    "./arrival-status": where,
  });
  const input = {
    motorcycleId: "moto",
    chassi: "ABC",
    source: "QR_CODE",
    operatorId: "operator",
    sessionId: "session",
  };
  const service = load("lib/services/check-in/receive.ts", {
    "@/lib/db": { prisma: { $transaction: (callback) => callback(tx) } },
    "@/lib/data/check-in": dal,
  });
  await Promise.all([
    service.receiveCheckInMotorcycle(input),
    service.receiveCheckInMotorcycle(input),
  ]);
  const firstTime = record.arrivedAt;
  await service.receiveCheckInMotorcycle(input);
  assert.equal(receipts, 1);
  assert.equal(record.arrivedAt, firstTime);
  assert.equal(record.forecastArrivalStatus, "ARRIVED");
});
test("sessão revogada entre consulta e confirmação impede qualquer alteração", async () => {
  const tx = { $queryRaw: async () => [] };
  const service = load("lib/services/check-in/receive.ts", {
    "@/lib/db": { prisma: { $transaction: (callback) => callback(tx) } },
    "@/lib/data/check-in": {},
  });
  assert.equal(
    await service.receiveCheckInMotorcycle({
      motorcycleId: "m",
      operatorId: "o",
      sessionId: "s",
    }),
    null,
  );
});
test("cron exclui motos recebidas e usa a previsão vencida", async () => {
  let condition;
  const dal = load("lib/data/check-in.ts", {
    "@/lib/db": {
      prisma: {
        motorcycle: {
          updateMany: async ({ where: filter }) => {
            condition = filter;
            return { count: 3 };
          },
        },
      },
    },
    "./arrival-status": where,
  });
  assert.equal((await dal.markOverdueMotorcycles()).count, 3);
  assert.equal(
    condition.AND[0].AND[0].NOT.OR[0].forecastArrivalStatus,
    "ARRIVED",
  );
  assert.equal(condition.AND[0].AND[0].NOT.OR[1].arrivedAt.not, null);
  assert.ok(condition.AND[0].AND[1].forecastArrival.lt instanceof Date);
});
test("ações públicas exigem sessão antes de consultar ou confirmar", async () => {
  const api = load("app/(public)/check-in/_actions/check-in.ts", {
    "next/headers": {},
    "@/lib/api/auth": {},
    "@/lib/arrival": arrival,
    "@/lib/check-in/credentials": credentials,
    "@/lib/check-in/revalidate": {},
    "@/lib/check-in/schemas": schemas,
    "@/lib/check-in/session": { getCheckInSession: async () => null },
    "@/lib/check-in/access": { getCheckInAccess: async () => null },
    "@/lib/services/check-in/receive": {},
    "@/lib/data/check-in": {},
  });
  assert.equal((await api.lookupMotorcycleAction({ chassi: "ABC" })).ok, false);
  assert.equal((await api.confirmArrivalAction({})).ok, false);
});

test("cron rejeita segredo ausente ou incorreto antes de executar a DAL", async () => {
  let executions = 0;
  const previous = process.env.CRON_SECRET;
  const api = load("app/api/cron/motorcycles/mark-delayed/route.ts", {
    "@/lib/check-in/revalidate": { revalidateArrivals() {} },
    "@/lib/data/check-in": {
      markOverdueMotorcycles: async () => {
        executions++;
        return { count: 2 };
      },
    },
  });
  try {
    delete process.env.CRON_SECRET;
    assert.equal(
      (await api.POST(new Request("http://localhost/api/cron"))).status,
      503,
    );
    process.env.CRON_SECRET = "test-only-secret";
    assert.equal(
      (
        await api.POST(
          new Request("http://localhost/api/cron", {
            headers: { authorization: "Bearer wrong" },
          }),
        )
      ).status,
      401,
    );
    assert.equal(executions, 0);
    const response = await api.POST(
      new Request("http://localhost/api/cron", {
        headers: { authorization: "Bearer test-only-secret" },
      }),
    );
    assert.equal(response.status, 200);
    assert.equal((await response.json()).updated, 2);
    assert.equal(executions, 1);
  } finally {
    if (previous === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previous;
  }
});

test("PIN inválido registra falha e jamais emite cookie ou sessão", async () => {
  let failures = 0;
  const api = load("app/(public)/check-in/_actions/check-in.ts", {
    "next/headers": { headers: async () => new Headers() },
    "@/lib/api/auth": { checkMutationRateLimit: async () => null },
    "@/lib/arrival": arrival,
    "@/lib/check-in/credentials": { verifyPin: async () => false },
    "@/lib/check-in/revalidate": {},
    "@/lib/check-in/schemas": schemas,
    "@/lib/check-in/session": {},
    "@/lib/check-in/access": {},
    "@/lib/services/check-in/receive": {},
    "@/lib/data/check-in": {
      findCheckInOperator: async () => ({
        id: "operator",
        active: true,
        pinHash: "hash",
        lockedUntil: null,
      }),
      recordPinFailure: async () => {
        failures++;
      },
    },
  });
  assert.equal(
    (await api.loginCheckInAction({ identifier: "operator", pin: "00000000" }))
      .ok,
    false,
  );
  assert.equal(failures, 1);
});

test("bloqueio de tentativas interrompe login antes da verificação do PIN", async () => {
  const api = load("app/(public)/check-in/_actions/check-in.ts", {
    "next/headers": { headers: async () => new Headers() },
    "@/lib/api/auth": { checkMutationRateLimit: async () => ({ status: 429 }) },
    "@/lib/arrival": arrival,
    "@/lib/check-in/credentials": {},
    "@/lib/check-in/revalidate": {},
    "@/lib/check-in/schemas": schemas,
    "@/lib/check-in/session": {},
    "@/lib/check-in/access": {},
    "@/lib/services/check-in/receive": {},
    "@/lib/data/check-in": {},
  });
  assert.equal(
    (await api.loginCheckInAction({ identifier: "operator", pin: "00000000" }))
      .ok,
    false,
  );
});
