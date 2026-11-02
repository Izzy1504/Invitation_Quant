import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadTypescript(file, dependencies = {}, globals = {}) {
  const source = fs.readFileSync(path.join(root, ...file.split("\\")), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require(name) {
      if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    ...globals,
  });
  return exports;
}

const { parseRsvp } = loadTypescript("src\\lib\\rsvp.ts");
const valid = {
  requestId: "e298385a-8cea-4eb6-8932-bc55b8380cbe",
  name: "  Nguyễn Ánh  ",
  attendance: "yes",
  guests: 2,
  note: "  Hẹn gặp Quang!  ",
  consent: true,
};

test("RSVP accepts all attendance choices and preserves Vietnamese text", () => {
  for (const attendance of ["yes", "maybe", "no"]) {
    const result = parseRsvp({ ...valid, attendance, guests: attendance === "no" ? 0 : 10 });
    assert.equal(result.name, "Nguyễn Ánh");
    assert.equal(result.note, "Hẹn gặp Quang!");
    assert.equal(result.attendance, attendance);
  }
});

test("RSVP rejects missing consent, invalid fields and exact length/count boundaries", () => {
  for (const value of [
    null, {}, { ...valid, consent: false }, { ...valid, name: " \t" },
    { ...valid, name: "a".repeat(81) }, { ...valid, note: "a".repeat(501) },
    { ...valid, requestId: "not-an-id" }, { ...valid, attendance: "constructor" },
    { ...valid, guests: 0 }, { ...valid, guests: 11 }, { ...valid, guests: 1.5 },
    { ...valid, attendance: "no", guests: 1 },
  ]) assert.equal(parseRsvp(value), null);
  assert.ok(parseRsvp({ ...valid, name: "a".repeat(80), note: "a".repeat(500), guests: 1 }));
});

function appsScript({ failStorage = false, lockAvailable = true } = {}) {
  const rows = [];
  let releases = 0;
  const sheet = {
    getLastRow: () => rows.length,
    appendRow: (row) => rows.push(row),
    setFrozenRows: () => {},
    getRange: () => ({
      createTextFinder: (id) => ({
        matchEntireCell: () => ({ findNext: () => rows.slice(1).find((row) => row[1] === id) || null }),
      }),
    }),
  };
  const context = {
    console: { error() {} },
    ContentService: {
      MimeType: { JSON: "application/json" },
      createTextOutput: (text) => ({ setMimeType: () => JSON.parse(text) }),
    },
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => "s".repeat(32) }) },
    LockService: { getScriptLock: () => ({
      tryLock: () => lockAvailable,
      releaseLock: () => { releases += 1; },
    }) },
    SpreadsheetApp: {
      openById: (id) => {
        assert.equal(id, "16Ygkcie0B0DWRSgCmJSkT0SqCkvTesV3PgtUJ-t2km0");
        if (failStorage) throw new Error("Permission denied");
        return { getSheetByName: () => rows.length ? sheet : null, insertSheet: () => sheet };
      },
      flush: () => {},
    },
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, "scripts", "google-sheets-rsvp.gs"), "utf8"), context);
  return {
    rows,
    releases: () => releases,
    post: (value) => context.doPost({ postData: { contents: JSON.stringify(value) } }),
  };
}

test("Apps Script stores a row in the requested sheet and deduplicates retries", () => {
  const app = appsScript();
  const payload = { ...valid, secret: "s".repeat(32) };
  assert.equal(app.post(payload).ok, true);
  assert.equal(app.post(payload).requestId, valid.requestId);
  assert.equal(app.rows.length, 2);
  assert.equal(app.rows[1][2], "Nguyễn Ánh");
  assert.equal(app.rows[1][4], 2);
  assert.equal(app.releases(), 2);
});

test("Apps Script escapes formulas and does not acknowledge invalid or failed writes", () => {
  const app = appsScript();
  app.post({ ...valid, secret: "s".repeat(32), name: "=IMPORTXML(\"url\")", note: "+1+1" });
  assert.equal(app.rows[1][2], "'=IMPORTXML(\"url\")");
  assert.equal(app.rows[1][5], "'+1+1");
  assert.equal(app.post({ ...valid, secret: "wrong" }).ok, false);
  assert.equal(app.post({ ...valid, secret: "s".repeat(32), guests: 11 }).ok, false);
  assert.equal(app.post({ ...valid, secret: "s".repeat(32), consent: false }).ok, false);
  const failed = appsScript({ failStorage: true });
  assert.equal(failed.post({ ...valid, secret: "s".repeat(32) }).ok, false);
  assert.equal(failed.releases(), 1);
  assert.equal(appsScript({ lockAvailable: false }).post({ ...valid, secret: "s".repeat(32) }).ok, false);
});

const endpoint = "https://script.google.com/macros/s/test-deployment/exec";
const quietConsole = { error() {} };
function route(fetch, env = { RSVP_GOOGLE_SCRIPT_URL: endpoint, RSVP_GOOGLE_SCRIPT_SECRET: "s".repeat(32) }) {
  return loadTypescript("src\\app\\api\\rsvp\\route.ts", { "@/lib/rsvp": { parseRsvp } }, {
    process: { env }, fetch, Response, URL, Buffer, AbortSignal, SyntaxError, Error, console: quietConsole,
  });
}
function request(body = valid, origin = "https://invitation.example") {
  return new Request("https://invitation.example/api/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(body),
  });
}

test("Server relay requires configuration, same-origin JSON and valid fields", async () => {
  const notCalled = () => { throw new Error("Upstream must not be called"); };
  assert.equal((await route(notCalled, {}).POST(request())).status, 503);
  assert.equal((await route(notCalled).POST(request(valid, "https://other.example"))).status, 403);
  assert.equal((await route(notCalled).POST(request({ ...valid, guests: 11 }))).status, 400);
  assert.equal((await route(notCalled).POST(request({ ...valid, note: "x".repeat(9000) }))).status, 413);
  assert.equal((await route(notCalled).POST(new Request("https://invitation.example/api/rsvp", {
    method: "POST", headers: { Origin: "https://invitation.example", "Content-Type": "application/json" }, body: "{invalid",
  }))).status, 400);
  assert.equal((await route(notCalled).POST(new Request("https://invitation.example/api/rsvp", {
    method: "POST", headers: { Origin: "https://invitation.example", "Content-Type": "text/plain" }, body: "test",
  }))).status, 415);
  assert.equal((await route(notCalled).GET(request())).status, 200);
  assert.equal((await (await route(notCalled, {}).GET(request())).json()).available, false);
});

test("Server relay reports success only after matching storage acknowledgment", async () => {
  const handler = route(async (url, options) => {
    assert.equal(url, endpoint);
    const sent = JSON.parse(options.body);
    assert.equal(sent.secret, "s".repeat(32));
    assert.equal(sent.name, "Nguyễn Ánh");
    return Response.json({ ok: true, requestId: sent.requestId });
  });
  const response = await handler.POST(request());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).requestId, valid.requestId);
  for (const result of [{ ok: false }, { ok: true, requestId: "wrong" }]) {
    assert.equal((await route(async () => Response.json(result)).POST(request())).status, 502);
  }
  assert.equal((await route(async () => { throw new Error("Offline"); }).POST(request())).status, 502);
  assert.equal((await route(async () => new Response("<html>Google sign-in required</html>")).POST(request())).status, 502);
});
