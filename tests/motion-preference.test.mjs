import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function preferenceStore(blocked = false) {
  const entries = new Map();
  const events = new EventTarget();
  const exports = {};
  const source = fs.readFileSync(new URL("../src/lib/motion-preference.ts", import.meta.url), "utf8");
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    exports, Event, console: { warn() {} },
    window: {
      localStorage: {
        getItem(key) { if (blocked) throw new Error("Storage blocked"); return entries.get(key) ?? null; },
        setItem(key, value) { if (blocked) throw new Error("Storage blocked"); entries.set(key, value); },
        removeItem(key) { if (blocked) throw new Error("Storage blocked"); entries.delete(key); },
      },
      addEventListener: events.addEventListener.bind(events),
      removeEventListener: events.removeEventListener.bind(events),
      dispatchEvent: events.dispatchEvent.bind(events),
    },
  });
  return { ...exports, entries, events };
}

test("Full motion is opt-in, persisted, removable, and observable", () => {
  const store = preferenceStore();
  assert.equal(store.getFullMotion(), false);
  let changes = 0;
  const unsubscribe = store.subscribeToFullMotion(() => changes++);
  store.setFullMotion(true);
  assert.equal(store.getFullMotion(), true);
  assert.equal(store.entries.get("invitation-full-motion"), "true");
  store.setFullMotion(false);
  assert.equal(store.getFullMotion(), false);
  assert.equal(store.entries.size, 0);
  store.events.dispatchEvent(new Event("storage"));
  assert.equal(changes, 3);
  unsubscribe();
  store.setFullMotion(true);
  assert.equal(changes, 3);
});

test("Blocked local storage retains a reversible tab-only choice", () => {
  const store = preferenceStore(true);
  assert.equal(store.getFullMotion(), false);
  store.setFullMotion(true);
  assert.equal(store.getFullMotion(), true);
  store.setFullMotion(false);
  assert.equal(store.getFullMotion(), false);
});
