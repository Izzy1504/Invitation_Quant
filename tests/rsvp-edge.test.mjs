import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function load(file, dependencies = {}, globals = {}) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require(name) {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    ...globals,
  });
  return exports;
}

const validation = load("../src/lib/rsvp.ts");
const config = {
  url: "https://script.google.com/macros/s/test/exec",
  secret: "s".repeat(64),
  origin: "https://izzy1504.github.io",
};
const payload = {
  requestId: "e298385a-8cea-4eb6-8932-bc55b8380cbe",
  name: "Nguyễn Ánh",
  attendance: "yes",
  guests: 1,
  note: "",
  consent: true,
};
function handler(fetch, configuration = config) {
  return load("../supabase/functions/_shared/rsvp-handler.ts", {
    "../../../src/lib/rsvp.ts": validation,
  }, {
    Request, Response, URL, AbortSignal, TextDecoder, Uint8Array, fetch,
    console: { error() {} },
  }).createRsvpHandler(configuration);
}
function request(method = "POST", body = JSON.stringify(payload), origin = config.origin) {
  return new Request("https://example.supabase.co/functions/v1/rsvp", {
    method,
    headers: { Origin: origin, "Content-Type": "application/json" },
    ...(method === "POST" ? { body } : {}),
  });
}

test("Edge RSVP handles Pages preflight, origin checks, availability, and bounded validation", async () => {
  const handle = handler(() => { throw new Error("Must not contact upstream"); });
  const preflight = await handle(request("OPTIONS"));
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), config.origin);
  assert.equal((await handle(request("GET", undefined, "https://other.example"))).status, 403);
  assert.equal((await handle(request("DELETE"))).status, 405);
  assert.deepEqual(await (await handle(request("GET"))).json(), { available: true });
  assert.equal((await handle(request("POST", "x".repeat(8193)))).status, 413);
  assert.equal((await handle(request("POST", "{"))).status, 400);
  assert.equal((await handle(request("POST", JSON.stringify({ ...payload, consent: false })))).status, 400);
  const unconfigured = handler(() => {}, { ...config, secret: undefined });
  assert.deepEqual(await (await unconfigured(request("GET"))).json(), { available: false });
  assert.equal((await unconfigured(request())).status, 503);
});

test("Edge RSVP only acknowledges matching Google Sheet writes and keeps secrets server-side", async () => {
  const handle = handler(async (url, options) => {
    assert.equal(url, config.url);
    const sent = JSON.parse(options.body);
    assert.equal(sent.secret, config.secret);
    assert.equal(sent.name, payload.name);
    return Response.json({ ok: true, requestId: sent.requestId });
  });
  const response = await handle(request());
  assert.equal(response.status, 200);
  const result = await response.text();
  assert.equal(result.includes(config.secret), false);
  assert.deepEqual(JSON.parse(result), { ok: true, requestId: payload.requestId });
  for (const upstream of [
    () => Response.json({ ok: true, requestId: "wrong" }),
    () => new Response("Unavailable", { status: 503 }),
    () => { throw new Error("Network failure"); },
  ]) {
    assert.equal((await handler(upstream)(request())).status, 502);
  }
});
