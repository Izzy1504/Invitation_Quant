import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync(new URL("../src/lib/sakura-webgl.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const exports = {};
vm.runInNewContext(outputText, { exports });
const { createSakuraRenderer } = exports;

function graphics({ compile = true, link = true } = {}) {
  const calls = [];
  const gl = {
    VERTEX_SHADER: 35633, FRAGMENT_SHADER: 35632, COMPILE_STATUS: 35713, LINK_STATUS: 35714,
    ARRAY_BUFFER: 34962, STATIC_DRAW: 35044, FLOAT: 5126, BLEND: 3042,
    SRC_ALPHA: 770, ONE_MINUS_SRC_ALPHA: 771, COLOR_BUFFER_BIT: 16384, TRIANGLES: 4,
    createShader: (type) => ({ type }),
    createProgram: () => ({}),
    createBuffer: () => ({}),
    shaderSource: (shader, text) => calls.push(["source", shader.type, text]),
    compileShader() {},
    getShaderParameter: () => compile,
    getShaderInfoLog: () => "Simulated shader failure",
    attachShader() {},
    linkProgram() {},
    getProgramParameter: () => link,
    getProgramInfoLog: () => "Simulated link failure",
    useProgram() {},
    bindBuffer() {},
    bufferData: (...args) => calls.push(["buffer", ...args]),
    getAttribLocation: (_, name) => name === "a_corner" ? 0 : 1,
    enableVertexAttribArray() {},
    vertexAttribPointer() {},
    getUniformLocation: (_, name) => name,
    enable() {},
    blendFunc() {},
    clearColor() {},
    viewport: (...args) => calls.push(["viewport", ...args]),
    uniform1f: (...args) => calls.push(["uniform1f", ...args]),
    uniform2f: (...args) => calls.push(["uniform2f", ...args]),
    clear() {},
    drawArrays: (...args) => calls.push(["draw", ...args]),
    deleteShader: () => calls.push(["deleteShader"]),
    deleteProgram: () => calls.push(["deleteProgram"]),
    deleteBuffer: () => calls.push(["deleteBuffer"]),
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: (type, options) => {
      assert.equal(type, "webgl");
      assert.equal(options.powerPreference, "low-power");
      assert.equal(options.depth, false);
      return gl;
    },
  };
  return { gl, canvas, calls };
}

test("WebGL sakura uses one bounded draw call for perspective petals", () => {
  const { canvas, calls } = graphics();
  const renderer = createSakuraRenderer(canvas, 80);
  const buffer = calls.find(([name]) => name === "buffer");
  assert.equal(buffer[2].length, 80 * 6 * 6);
  renderer.resize(390, 844, 1.25);
  assert.equal(canvas.width, 488);
  assert.equal(canvas.height, 1055);
  renderer.render(10, 0.3, -0.5, 1);
  assert.deepEqual(calls.find(([name]) => name === "draw"), ["draw", 4, 0, 480]);
  assert.ok(calls.some(([type, name, value]) => type === "uniform1f" && name === "u_aspect" && value === 390 / 844));
  assert.ok(calls.some(([type, name, value]) => type === "uniform1f" && name === "u_arrival" && value === 1));
  renderer.dispose();
  assert.equal(calls.filter(([name]) => name === "deleteShader").length, 2);
  assert.equal(calls.filter(([name]) => name === "deleteProgram").length, 1);
  assert.equal(calls.filter(([name]) => name === "deleteBuffer").length, 1);
});

test("WebGL unavailability and shader/link failures surface errors and release GPU resources", () => {
  assert.throws(() => createSakuraRenderer({ getContext: () => null }, 80), /WebGL is unavailable/);
  const shaderFailure = graphics({ compile: false });
  assert.throws(() => createSakuraRenderer(shaderFailure.canvas, 80), /Simulated shader failure/);
  assert.equal(shaderFailure.calls.filter(([name]) => name === "deleteShader").length, 1);
  assert.equal(shaderFailure.calls.filter(([name]) => name === "deleteProgram").length, 1);
  const linkFailure = graphics({ link: false });
  assert.throws(() => createSakuraRenderer(linkFailure.canvas, 80), /Simulated link failure/);
  assert.equal(linkFailure.calls.filter(([name]) => name === "deleteShader").length, 2);
  assert.equal(linkFailure.calls.filter(([name]) => name === "deleteProgram").length, 1);
});
