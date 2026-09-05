import fs from "node:fs";

const target = "src/app/globals.css";
const source = "DENTO_REAL_ORDER_CHECKOUT_STYLES.css";

if (!fs.existsSync(target)) {
  console.error("Missing src/app/globals.css. Run this from inside dento-hub-app.");
  process.exit(1);
}

const block = fs.readFileSync(source, "utf8").trim();
let css = fs.readFileSync(target, "utf8");

const startMarker = "/* DENTO_REAL_ORDER_CHECKOUT_V1_START */";
const endMarker = "/* DENTO_REAL_ORDER_CHECKOUT_V1_END */";

const start = css.indexOf(startMarker);
const end = css.indexOf(endMarker);

if (start !== -1 && end !== -1 && end > start) {
  css = css.slice(0, start) + block + css.slice(end + endMarker.length);
} else {
  css = css.trimEnd() + "\n\n" + block + "\n";
}

fs.writeFileSync(target, css, "utf8");
console.log("DENTO HUB real order checkout styles installed.");
