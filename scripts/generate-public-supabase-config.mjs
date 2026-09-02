import fs from "node:fs";
import path from "node:path";

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const rawLine of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const local = loadEnvFile(path.resolve(".env.local"));

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  local.NEXT_PUBLIC_SUPABASE_URL ||
  "";

const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  local.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  local.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

if (!url || !key) {
  console.error("");
  console.error("DENTO HUB BUILD STOPPED: Supabase public configuration is missing.");
  console.error("Required:");
  console.error("  NEXT_PUBLIC_SUPABASE_URL");
  console.error("  NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)");
  console.error("");
  process.exit(1);
}

try {
  new URL(url);
} catch {
  console.error("DENTO HUB BUILD STOPPED: NEXT_PUBLIC_SUPABASE_URL is invalid.");
  process.exit(1);
}

const output = `// AUTO-GENERATED DURING BUILD. DO NOT COMMIT.
export const SUPABASE_PUBLIC_URL = ${JSON.stringify(url)};
export const SUPABASE_PUBLIC_KEY = ${JSON.stringify(key)};
`;

const target = path.resolve("src/lib/supabase/generated-public-config.ts");
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, output, "utf8");

console.log("DENTO HUB: public Supabase browser config generated successfully.");
