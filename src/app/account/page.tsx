// @ts-nocheck
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, LayoutDashboard, MapPin, PackageCheck, ShieldCheck, ShoppingBag, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/login?next=/account");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const [{ data: profile }, { data: admin }, {data:cartRow}] = await Promise.all([
    supabase.from("profiles").select("full_name,phone,academic_year,universities(name_en)").eq("id", user.id).maybeSingle(),
    supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle(),
    supabase.from("carts").select("id").eq("user_id",user.id).maybeSingle(),
  ]);

  const [{count:wishlistCount},{count:addressCount},{count:orderCount},{count:cartCount}] = await Promise.all([
    supabase.from("wishlists").select("product_id",{count:"exact",head:true}).eq("user_id",user.id),
    supabase.from("addresses").select("id",{count:"exact",head:true}).eq("user_id",user.id),
    supabase.from("orders").select("id",{count:"exact",head:true}).eq("user_id",user.id),
    cartRow?.id?supabase.from("cart_items").select("id",{count:"exact",head:true}).eq("cart_id",cartRow.id):Promise.resolve({count:0}),
  ]);

  const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "DENTO HUB user";
  const universityRelation = profile?.universities as unknown as { name_en?: string } | { name_en?: string }[] | null;
  const university = Array.isArray(universityRelation) ? universityRelation[0]?.name_en : universityRelation?.name_en;

  return (
    <main className="account-page-main">
      <div className="shell account-page-shell">
        <section className="account-page-hero">
          <span className="account-page-icon"><UserRound /></span>
          <div><span className="section-kicker">YOUR ACCOUNT</span><h1>Hi, {String(fullName).split(/\s+/)[0]}</h1><p>{user.email}</p></div>
          {admin && <span className="account-role-chip"><ShieldCheck size={15} /> Administrator</span>}
        </section>

        <div className="account-page-grid">
          <section className="account-panel"><h2>Saved profile</h2><div className="account-facts"><div><span>Email</span><b>{user.email || "—"}</b></div><div><span>Phone</span><b>{profile?.phone || "Not added"}</b></div><div><span>University</span><b>{university || "Not added"}</b></div><div><span>Academic year</span><b>{profile?.academic_year ? `Year ${profile.academic_year}` : "Not added"}</b></div></div></section>
          <section className="account-panel account-actions-panel"><h2>Quick access</h2>{admin ? <Link href="/admin" className="account-big-action admin-action"><span><LayoutDashboard /></span><div><b>Open Admin Dashboard</b><small>Insights, products, pending prices, ads, courses and delivery</small></div></Link> : <Link href="/shop" className="account-big-action"><span><PackageCheck /></span><div><b>Continue shopping</b><small>Your signed-in cart and wishlist are saved to this account</small></div></Link>}</section>
        </div>

        <section className="account-panel account-data-panel"><div className="dash-title"><div><h2>Saved to your DENTO HUB account</h2><p>These records live in Supabase, so signing out or using another device does not erase them.</p></div></div><div className="account-saved-grid"><Link href="/cart"><ShoppingBag/><span><b>{cartCount||0}</b><small>Cart products</small></span></Link><Link href="/wishlist"><Heart/><span><b>{wishlistCount||0}</b><small>Wishlist products</small></span></Link><div><MapPin/><span><b>{addressCount||0}</b><small>Saved addresses</small></span></div><Link href="/account/orders"><PackageCheck/><span><b>{orderCount||0}</b><small>Orders</small></span></Link></div></section>
      </div>
    </main>
  );
}
