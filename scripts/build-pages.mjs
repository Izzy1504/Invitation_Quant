import { cpSync, existsSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const stage = resolve(root, ".pages-build");
if (!process.env.NEXT_PUBLIC_RSVP_ENDPOINT) {
  throw new Error("NEXT_PUBLIC_RSVP_ENDPOINT must point to the deployed Supabase RSVP function.");
}
const endpoint = new URL(process.env.NEXT_PUBLIC_RSVP_ENDPOINT);
if (endpoint.protocol !== "https:" || !endpoint.hostname.endsWith(".supabase.co") ||
    endpoint.pathname !== "/functions/v1/rsvp" || endpoint.search || endpoint.hash) {
  throw new Error("Invalid public Supabase RSVP endpoint.");
}
mkdirSync(stage, { recursive: true });
for (const name of ["src", "public", ".next", "out"]) {
  rmSync(join(stage, name), { recursive: true, force: true });
}
for (const name of ["src", "public", "next.config.ts", "tsconfig.json", "package.json", "next-env.d.ts"]) {
  if (existsSync(join(root, name))) {
    cpSync(join(root, name), join(stage, name), {
      recursive: true,
      filter: (source) => source !== join(root, "src", "app", "api"),
    });
  }
}
if (!existsSync(join(stage, "node_modules"))) {
  symlinkSync(join(root, "node_modules"), join(stage, "node_modules"), "junction");
}
const build = spawnSync(process.execPath, [join(root, "node_modules", "next", "dist", "bin", "next"), "build"], {
  cwd: stage,
  stdio: "inherit",
  env: { ...process.env, GITHUB_PAGES: "true", NEXT_PUBLIC_BASE_PATH: "/Invitation_Quant" },
});
if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status ?? 1);
writeFileSync(join(stage, "out", ".nojekyll"), "");
