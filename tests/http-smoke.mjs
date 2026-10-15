import assert from "node:assert/strict";

const base = new URL(process.argv[2] ?? "http://localhost:3000");

for (const path of ["/tracking", "/sign-in"]) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.ok(
    html.includes(
      path === "/tracking" ? 'id="tracking-document"' : 'type="password"',
    ),
    `${path}: expected form`,
  );
  console.log(`OK ${path}: 200`);
}

for (const path of ["/bdc", "/inventory", "/squad", "/support"]) {
  const response = await fetch(new URL(path, base), { redirect: "manual" });
  assert.ok([303, 307, 308].includes(response.status), path);
  assert.ok(response.headers.get("location")?.includes("/sign-in"), path);
  console.log(`OK ${path}: login redirect`);
}

// Deliberately omit credentials: none of these probes can mutate application data.
for (const path of [
  "/api/v1/bdc/clients",
  "/api/v1/inventory/motorcycles",
  "/api/v1/admin/users",
  "/api/v1/support/tickets",
]) {
  const response = await fetch(new URL(path, base), {
    method: "POST",
    headers: { Origin: base.origin, "Content-Type": "application/json" },
    body: "{}",
  });
  assert.equal(response.status, 401, path);
  console.log(`OK ${path}: anonymous mutation rejected`);
}

const crossOrigin = await fetch(new URL("/api/v1/bdc/clients", base), {
  method: "POST",
  headers: {
    Origin: "https://untrusted.example",
    "Content-Type": "application/json",
  },
  body: "{}",
});
assert.equal(crossOrigin.status, 403);
console.log("OK cross-origin mutation rejected");
