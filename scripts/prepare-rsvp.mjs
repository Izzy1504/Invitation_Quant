import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseEnv } from "node:util";

const root = process.cwd();
const envPath = resolve(root, ".env.local");
const source = readFileSync(resolve(root, "scripts", "google-sheets-rsvp.gs"), "utf8");
let envText = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
const env = parseEnv(envText);
let secret = env.RSVP_GOOGLE_SCRIPT_SECRET;

if (secret && secret.length < 32) {
  throw new Error("Existing RSVP_GOOGLE_SCRIPT_SECRET is too short. Correct it before preparing setup.");
}
if (!secret) {
  secret = randomBytes(32).toString("hex");
  envText += `${envText && !envText.endsWith("\n") ? "\n" : ""}RSVP_GOOGLE_SCRIPT_SECRET=${secret}\n`;
}
if (!env.RSVP_GOOGLE_SCRIPT_URL) {
  if (!Object.hasOwn(env, "RSVP_GOOGLE_SCRIPT_URL")) {
    envText += "RSVP_GOOGLE_SCRIPT_URL=\n";
  }
}
if (!existsSync(envPath) || readFileSync(envPath, "utf8") !== envText) {
  writeFileSync(envPath, envText, { mode: 0o600 });
}

const outputDirectory = resolve(root, ".rsvp-local");
mkdirSync(outputDirectory, { recursive: true });
const setup = `

// Run once in the Apps Script editor before deploying. Never share this private file.
function setupRsvp() {
  SpreadsheetApp.openById(SHEET_ID).getName();
  PropertiesService.getScriptProperties().setProperty("RSVP_SECRET", ${JSON.stringify(secret)});
  console.log("RSVP configured. Deploy as a Web app: execute as Me, access Anyone.");
}
`;
writeFileSync(resolve(outputDirectory, "paste-into-apps-script.gs"), source + setup, { mode: 0o600 });
console.log("Prepared .rsvp-local\\paste-into-apps-script.gs and .env.local.");
console.log("Private files are gitignored. Do not share them or paste their contents into chat.");
console.log("Paste the generated script into Apps Script, run setupRsvp once, then deploy.");
console.log("Only the /exec deployment URL is still needed; the server remains unavailable until configured.");
