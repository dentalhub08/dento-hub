import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const patches = [
  {
    file: 'src/components/admin-orders.tsx',
    edits: [
      {
        from: `type OrderItem = {\n  id: string;\n  order_id: string;\n  product_name_en: string;\n  variation_snapshot: Record<string, unknown> | null;\n  quantity: number;\n  final_unit_price: number;\n};`,
        to: `type OrderItem = {\n  id: string;\n  order_id: string;\n  product_name_en: string;\n  variation_snapshot: Record<string, unknown> | null;\n  quantity: number;\n  final_unit_price: number;\n};\ntype ProfileRow = {\n  id: string;\n  full_name: string | null;\n  phone: string | null;\n};`
      },
      {
        from: `const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]));`,
        to: `const profileMap = new Map<string, ProfileRow>(((profiles || []) as ProfileRow[]).map((profile) => [profile.id, profile]));`
      }
    ]
  },
  {
    file: 'src/components/admin-settings.tsx',
    edits: [
      {
        from: `.maybeSingle().then(({data})=>{if(data)setForm(`,
        to: `.maybeSingle().then(({data}: {data: {support_email:string|null;support_phone:string|null;whatsapp_number:string|null;default_delivery_fee_egp:number|string|null;free_delivery_threshold_egp:number|string|null;default_locale:string|null}|null})=>{if(data)setForm(`
      }
    ]
  },
  {
    file: 'src/components/admin-top-controls.tsx',
    edits: [
      {
        from: `supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || "Admin"));`,
        to: `supabase.auth.getUser().then(({ data }: { data: { user: { email?: string | null } | null } }) => setEmail(data.user?.email || "Admin"));`
      }
    ]
  },
  {
    file: 'src/components/auth-account-menu.tsx',
    edits: [
      {
        from: `type SessionUser = {\n  id: string;\n  email?: string | null;\n  user_metadata?: Record<string, unknown>;\n};`,
        to: `type SessionUser = {\n  id: string;\n  email?: string | null;\n  user_metadata?: Record<string, unknown>;\n};\ntype AuthSession = { user?: SessionUser | null } | null;`
      },
      {
        from: `supabase.auth.getUser().then(({ data }) => void applyUser(data.user as SessionUser | null));`,
        to: `supabase.auth.getUser().then(({ data }: { data: { user: SessionUser | null } }) => void applyUser(data.user));`
      },
      {
        from: `const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {`,
        to: `const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: AuthSession) => {`
      }
    ]
  },
  {
    file: 'src/components/auth-form.tsx',
    edits: [
      {
        from: `.then(({ data }) => {\n        if (!active) return;\n        setUniversities((data || []) as University[]);`,
        to: `.then(({ data }: { data: University[] | null }) => {\n        if (!active) return;\n        setUniversities(data || []);`
      }
    ]
  },
  {
    file: 'src/components/checkout-client.tsx',
    edits: [
      {
        from: `s.auth.getUser().then(({data})=>setAuth(data.user?"yes":"no"));`,
        to: `s.auth.getUser().then(({data}: {data: {user: {id:string}|null}})=>setAuth(data.user?"yes":"no"));`
      }
    ]
  },
  {
    file: 'src/components/store-provider.tsx',
    edits: [
      {
        from: `supabase.auth.getUser().then(({ data }) => void hydrate(data.user?.id || null));`,
        to: `supabase.auth.getUser().then(({ data }: { data: { user: { id: string } | null } }) => void hydrate(data.user?.id || null));`
      },
      {
        from: `const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {`,
        to: `const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: { user?: { id: string } | null } | null) => {`
      }
    ]
  }
];

const staged = [];
for (const patch of patches) {
  const filePath = path.join(root, patch.file);
  if (!fs.existsSync(filePath)) {
    console.error(`ERROR: missing ${patch.file}`);
    process.exit(1);
  }
  let text = fs.readFileSync(filePath, 'utf8');
  for (const [index, edit] of patch.edits.entries()) {
    if (!text.includes(edit.from)) {
      console.error(`ERROR: expected code not found in ${patch.file} (edit ${index + 1}).`);
      console.error('No files were changed.');
      process.exit(1);
    }
    text = text.replace(edit.from, edit.to);
  }
  staged.push([filePath, text, patch.file]);
}

for (const [filePath, text, rel] of staged) {
  fs.writeFileSync(filePath, text, 'utf8');
  console.log(`fixed ${rel}`);
}
console.log('\nAll reported TypeScript errors patched. Now run: npm run build:cloudflare');
