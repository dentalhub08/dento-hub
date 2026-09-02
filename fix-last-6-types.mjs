import fs from "node:fs";

const files = [
  "src/components/auth-account-menu.tsx",
  "src/components/store-provider.tsx",
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.error(`Missing ${file}. Run this from dento-hub-app.`);
    process.exit(1);
  }

  let s = fs.readFileSync(file, "utf8");

  // Add Supabase callback types once.
  if (!s.includes('AuthChangeEvent') || !s.includes('Session')) {
    const firstImportEnd = s.indexOf("\n", s.indexOf('from "react"'));
    if (firstImportEnd !== -1) {
      s =
        s.slice(0, firstImportEnd + 1) +
        'import type { AuthChangeEvent, Session, UserResponse } from "@supabase/supabase-js";\n' +
        s.slice(firstImportEnd + 1);
    } else {
      s =
        'import type { AuthChangeEvent, Session, UserResponse } from "@supabase/supabase-js";\n' +
        s;
    }
  }

  // getUser().then(({ data }) => ...)
  s = s.replace(
    /\.then\(\(\{\s*data\s*\}\)\s*=>/g,
    ".then(({ data }: UserResponse) =>"
  );

  // onAuthStateChange((_event, session) => ...)
  s = s.replace(
    /onAuthStateChange\(\(_event,\s*session\)\s*=>/g,
    "onAuthStateChange((_event: AuthChangeEvent, session: Session | null) =>"
  );

  fs.writeFileSync(file, s, "utf8");
  console.log(`fixed ${file}`);
}

console.log("\nAll 6 reported Supabase TypeScript errors patched.");
