import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({children}:{children:React.ReactNode}){
  const supabase = await createClient();
  if (!supabase) redirect("/login?next=/admin");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) redirect("/");
  return <div className="admin-portal"><AdminShell>{children}</AdminShell></div>;
}
