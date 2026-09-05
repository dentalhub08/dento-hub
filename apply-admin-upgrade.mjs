import fs from "node:fs";

const file = "src/app/globals.css";
if (!fs.existsSync(file)) {
  console.error("Missing src/app/globals.css. Run this from inside dento-hub-app.");
  process.exit(1);
}

let css = fs.readFileSync(file, "utf8");
const startMarker = "/* DENTO_ADMIN_MOBILE_MEDIA_BUNDLES_V1_START */";
const endMarker = "/* DENTO_ADMIN_MOBILE_MEDIA_BUNDLES_V1_END */";

const block = fs.readFileSync("DENTO_ADMIN_UPGRADE_STYLES.css", "utf8").trim();

const start = css.indexOf(startMarker);
const end = css.indexOf(endMarker);

if (start !== -1 && end !== -1 && end > start) {
  css = css.slice(0, start) + block + css.slice(end + endMarker.length);
} else {
  css = css.trimEnd() + "\n\n" + block + "\n";
}

fs.writeFileSync(file, css, "utf8");
console.log("Admin mobile + media + bundle styles installed.");
