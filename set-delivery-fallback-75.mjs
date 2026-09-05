import fs from "node:fs";

const file = "src/data/site.ts";

if (!fs.existsSync(file)) {
  console.log("src/data/site.ts not found — database rules are still enough.");
  process.exit(0);
}

let text = fs.readFileSync(file, "utf8");

function patchObjectBy(pattern, label) {
  const rx = new RegExp(`\\{[^{}]{0,700}${pattern}[^{}]{0,700}\\}`, "gi");
  let changed = false;

  text = text.replace(rx, (block) => {
    if (!/\bfee\s*:\s*\d+/i.test(block)) return block;
    changed = true;
    return block.replace(/\bfee\s*:\s*\d+(?:\.\d+)?/i, "fee: 75");
  });

  console.log(changed ? `${label} static fallback -> 75 EGP` : `${label} fallback not found; skipped.`);
}

patchObjectBy(`(?:id\\s*:\\s*["']aiu["']|name\\s*:\\s*["']Alamein International University["'])`, "AIU");
patchObjectBy(`(?:id\\s*:\\s*["']alexandria["']|name\\s*:\\s*["']Alexandria["'])`, "Alexandria");

fs.writeFileSync(file, text, "utf8");
console.log("DENTO HUB delivery fallback patch complete.");
