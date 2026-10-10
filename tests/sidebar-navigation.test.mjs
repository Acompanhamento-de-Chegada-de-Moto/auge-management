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
test("sidebar seleciona apenas a rota mais específica e preserva permissões", () => {
  const navigation = load("lib/sidebar-navigation.ts");
  const admin = navigation.getSidebarSections("ADMIN");
  assert.equal(
    navigation.getActiveSidebarHref("/squad/check-in", admin),
    "/squad/check-in",
  );
  assert.equal(
    navigation.getActiveSidebarHref("/squad/check-in/details", admin),
    "/squad/check-in",
  );
  assert.equal(
    navigation.getActiveSidebarHref("/squad/check-ins", admin),
    "/squad",
  );
  assert.equal(
    navigation.getActiveSidebarHref("/inventory/motorcycle/new", admin),
    "/inventory",
  );
  for (const role of ["USER", null]) {
    const paths = navigation
      .getSidebarSections(role)
      .flatMap((section) => section.items.map((item) => item.href));
    assert.equal(paths.includes("/squad/check-in"), false);
    assert.equal(paths.includes("/dashboard"), false);
    assert.equal(paths.includes("/support"), false);
    assert.equal(paths.includes("/check-in"), true);
  }
  const manager = navigation.getSidebarSections("MANAGER");
  assert.equal(
    manager
      .flatMap((section) => section.items)
      .some((item) => item.href === "/support"),
    true,
  );
});
