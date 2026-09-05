import fs from "node:fs";

const target = "src/app/globals.css";
const source = "DENTO_ADMIN_ORDERS_MOBILE_V3.css";

if (!fs.existsSync(target)) {
  console.error("Missing src/app/globals.css. Run this inside dento-hub-app.");
  process.exit(1);
}

let css = fs.readFileSync(target, "utf8");
const block = fs.readFileSync(source, "utf8").trim();

const startMarker = "/* DENTO_ADMIN_ORDERS_MOBILE_V3_START */";
const endMarker = "/* DENTO_ADMIN_ORDERS_MOBILE_V3_END */";

const start = css.indexOf(startMarker);
const end = css.indexOf(endMarker);

if (start !== -1 && end !== -1 && end > start) {
  css = css.slice(0, start) + block + css.slice(end + endMarker.length);
} else {
  css = css.trimEnd() + "\n\n" + block + "\n";
}

fs.writeFileSync(target, css, "utf8");
console.log("DENTO HUB Admin Orders V3 mobile styles installed.");
