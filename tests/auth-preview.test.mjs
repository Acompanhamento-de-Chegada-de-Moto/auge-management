import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import ts from "typescript";

const module = { exports: {} };
const source = ts.transpileModule(
  readFileSync(new URL("../lib/auth-base-url.ts", import.meta.url), "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  },
);
runInNewContext(source.outputText, {
  module,
  exports: module.exports,
  process,
});
const { getAuthBaseURL } = module.exports;
const preview = {
  VERCEL_ENV: "preview",
  VERCEL_URL: "auge-abc123-team.vercel.app",
  VERCEL_BRANCH_URL: "auge-git-refactor-team.vercel.app",
  BETTER_AUTH_URL: "https://production.example.com",
};

test("preview ignora URL fixa e exige hosts fornecidos pela Vercel", () => {
  const config = getAuthBaseURL(preview);
  assert.equal(config.protocol, "https");
  assert.deepEqual(Array.from(config.allowedHosts), [
    preview.VERCEL_URL,
    preview.VERCEL_BRANCH_URL,
  ]);
  assert.equal(config.fallback, undefined);
  assert.throws(
    () => getAuthBaseURL({ VERCEL_ENV: "preview" }),
    /System Environment Variables/,
  );
});

test("produção e desenvolvimento preservam o domínio configurado", () => {
  assert.equal(
    getAuthBaseURL({ BETTER_AUTH_URL: "http://localhost:3000" }),
    "http://localhost:3000",
  );
  assert.equal(
    getAuthBaseURL({ ...preview, VERCEL_ENV: "production" }),
    preview.BETTER_AUTH_URL,
  );
  assert.equal(
    getAuthBaseURL({
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "auge.example.com",
    }),
    "https://auge.example.com",
  );
});

test("Better Auth autentica nos dois hosts de preview e rejeita origem externa", async () => {
  const auth = betterAuth({
    baseURL: getAuthBaseURL(preview),
    secret: "test-only-auth-secret-012345678901234567890123456789",
    database: memoryAdapter({
      user: [],
      session: [],
      account: [],
      verification: [],
    }),
    emailAndPassword: { enabled: true },
    rateLimit: { enabled: false },
    logger: { disabled: true },
  });
  for (const [index, host] of [
    preview.VERCEL_URL,
    preview.VERCEL_BRANCH_URL,
  ].entries()) {
    const origin = `https://${host}`;
    const email = `preview-${index}@example.com`;
    const password = "test-only-password-1234";
    const request = (path, body, requestOrigin = origin) =>
      new Request(`${origin}/api/auth/${path}`, {
        method: "POST",
        headers: {
          host,
          origin: requestOrigin,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });
    const signup = await auth.handler(
      request("sign-up/email", { name: "Preview test", email, password }),
    );
    assert.equal(signup.status, 200);
    const response = await auth.handler(
      request("sign-in/email", { email, password, callbackURL: "/bdc" }),
    );
    assert.equal(response.status, 200);
    assert.match(
      response.headers.get("set-cookie"),
      /__Secure-better-auth.session_token=/,
    );
    assert.match(response.headers.get("set-cookie"), /Secure/);
    const session = await auth.handler(
      new Request(`${origin}/api/auth/get-session`, {
        headers: {
          host,
          cookie: response.headers.get("set-cookie").split(";")[0],
        },
      }),
    );
    assert.equal((await session.json()).user.email, email);
    const serverSession = await auth.api.getSession({
      headers: new Headers({
        host,
        cookie: response.headers.get("set-cookie").split(";")[0],
      }),
    });
    assert.equal(serverSession.user.email, email);
    const externalRequest = request(
      "sign-in/email",
      { email, password },
      "https://other-project.vercel.app",
    );
    externalRequest.headers.set(
      "cookie",
      response.headers.get("set-cookie").split(";")[0],
    );
    const denied = await auth.handler(externalRequest);
    assert.equal(denied.status, 403);
    const callbackDenied = await auth.handler(
      request("sign-in/email", {
        email,
        password,
        callbackURL: "https://production.example.com/bdc",
      }),
    );
    assert.equal(callbackDenied.status, 403);
  }
});
