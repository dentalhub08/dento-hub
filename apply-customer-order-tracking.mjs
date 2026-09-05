import fs from "node:fs";

function patchCss() {
  const target = "src/app/globals.css";
  const source = "DENTO_CUSTOMER_ORDER_TRACKING_STYLES.css";

  if (!fs.existsSync(target)) {
    console.error("Missing src/app/globals.css. Run this inside dento-hub-app.");
    process.exit(1);
  }

  const block = fs.readFileSync(source, "utf8").trim();
  let css = fs.readFileSync(target, "utf8");

  const startMarker = "/* DENTO_CUSTOMER_ORDER_TRACKING_V1_START */";
  const endMarker = "/* DENTO_CUSTOMER_ORDER_TRACKING_V1_END */";

  const start = css.indexOf(startMarker);
  const end = css.indexOf(endMarker);

  if (start !== -1 && end !== -1 && end > start) {
    css = css.slice(0, start) + block + css.slice(end + endMarker.length);
  } else {
    css = css.trimEnd() + "\n\n" + block + "\n";
  }

  fs.writeFileSync(target, css, "utf8");
  console.log("✓ Customer order tracking styles installed.");
}

function patchAccountPage() {
  const target = "src/app/account/page.tsx";
  if (!fs.existsSync(target)) {
    console.log("• Account page not found; skipped account Orders shortcut.");
    return;
  }

  let text = fs.readFileSync(target, "utf8");
  if (text.includes('href="/account/orders"')) {
    console.log("✓ Account page already links to My Orders.");
    return;
  }

  const oldTile =
    '<div><PackageCheck/><span><b>{orderCount||0}</b><small>Orders</small></span></div>';
  const newTile =
    '<Link href="/account/orders"><PackageCheck/><span><b>{orderCount||0}</b><small>Orders</small></span></Link>';

  if (text.includes(oldTile)) {
    text = text.replace(oldTile, newTile);
    fs.writeFileSync(target, text, "utf8");
    console.log("✓ Account Orders tile now opens /account/orders.");
  } else {
    console.log("• Account Orders tile markup changed; route is installed but shortcut patch was skipped.");
  }
}

function patchAccountMenu() {
  const target = "src/components/auth-account-menu.tsx";
  if (!fs.existsSync(target)) {
    console.log("• Account menu not found; skipped menu shortcut.");
    return;
  }

  let text = fs.readFileSync(target, "utf8");
  if (text.includes('href="/account/orders"')) {
    console.log("✓ Account menu already has My orders.");
    return;
  }

  const needle =
    '<Link href="/account"><UserRound size={16} /> {arabic ? "حسابي" : "My account"}</Link>';

  if (text.includes(needle)) {
    const insertion =
      needle +
      '\n            <Link href="/account/orders"><PackageCheck size={16} /> {arabic ? "طلباتي" : "My orders"}</Link>';
    text = text.replace(needle, insertion);

    if (!text.includes("PackageCheck,")) {
      text = text.replace(
        "  LayoutDashboard,\n",
        "  LayoutDashboard,\n  PackageCheck,\n"
      );
    }

    fs.writeFileSync(target, text, "utf8");
    console.log("✓ Account dropdown now has My orders.");
  } else {
    console.log("• Account menu markup changed; route is installed but menu shortcut patch was skipped.");
  }
}

patchCss();
patchAccountPage();
patchAccountMenu();

console.log("");
console.log("DENTO HUB customer order tracking installed.");
console.log("Routes:");
console.log("  /account/orders");
console.log("  /account/orders/[id]");
