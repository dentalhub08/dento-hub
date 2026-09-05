import fs from "node:fs";

const file = "src/app/globals.css";
if (!fs.existsSync(file)) {
  console.error("Missing src/app/globals.css. Run this inside dento-hub-app.");
  process.exit(1);
}

let css = fs.readFileSync(file, "utf8");
const block = fs.readFileSync("DENTO_ADMIN_EDITOR_MOBILE_FIX_V2.css", "utf8").trim();
const START = "/* DENTO_ADMIN_EDITOR_MOBILE_FIX_V2_START */";
const END = "/* DENTO_ADMIN_EDITOR_MOBILE_FIX_V2_END */";
const start = css.indexOf(START);
const end = css.indexOf(END);

if (start !== -1 && end !== -1 && end > start) {
  css = css.slice(0, start) + block + css.slice(end + END.length);
} else {
  css = css.trimEnd() + "\n\n" + block + "\n";
}

fs.writeFileSync(file, css, "utf8");
console.log("DENTO HUB Admin editor/mobile V2 CSS installed.");
