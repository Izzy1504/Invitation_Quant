import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const prepare = join(root, "scripts", "prepare-rsvp.mjs");

test("RSVP setup generates matching private configuration and preserves it on rerun", () => {
  const directory = mkdtempSync(join(tmpdir(), "izzy-rsvp-setup-"));
  try {
    mkdirSync(join(directory, "scripts"));
    writeFileSync(join(directory, "scripts", "google-sheets-rsvp.gs"),
      readFileSync(join(root, "scripts", "google-sheets-rsvp.gs")));
    const run = () => spawnSync(process.execPath, [prepare], { cwd: directory, encoding: "utf8" });
    const first = run();
    assert.equal(first.status, 0, first.stderr);
    const envPath = join(directory, ".env.local");
    const env = parseEnv(readFileSync(envPath, "utf8"));
    assert.match(env.RSVP_GOOGLE_SCRIPT_SECRET, /^[a-f0-9]{64}$/);
    assert.equal(first.stdout.includes(env.RSVP_GOOGLE_SCRIPT_SECRET), false);
    let storedSecret;
    const context = vm.createContext({
      SpreadsheetApp: { openById: () => ({ getName: () => "Invitation" }) },
      PropertiesService: { getScriptProperties: () => ({
        setProperty: (key, value) => {
          assert.equal(key, "RSVP_SECRET");
          storedSecret = value;
        },
      }) },
      console: { log() {} },
    });
    vm.runInContext(readFileSync(join(directory, ".rsvp-local", "paste-into-apps-script.gs"), "utf8"), context);
    vm.runInContext("setupRsvp()", context);
    assert.equal(storedSecret, env.RSVP_GOOGLE_SCRIPT_SECRET);
    const configured = readFileSync(envPath, "utf8").replace("RSVP_GOOGLE_SCRIPT_URL=",
      "RSVP_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/test/exec");
    writeFileSync(envPath, configured);
    assert.equal(run().status, 0);
    assert.equal(readFileSync(envPath, "utf8"), configured);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
