import Link from "next/link";
import { Package, ShoppingBag, CircleDollarSign, Users, ArrowUpRight, AlertTriangle, Truck, Clock3, ImageIcon, CircleCheck, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { titleCaseSource } from "@/lib/format";

export const dynamic="force-dynamic";

type PendingRow={source_name:string|null};
type DeliveryRow={fee_egp:number|string;universities?:{name_en:string}|{name_en:string}[]|null};

export default async function Admin(){
  const supabase=await createClient();
  let total=119,publicReady=0,pendingCount=0,orders=0,customers=0,adCount=0,aiuFee:number|null=null;
  let pending:PendingRow[]=[];
  if(supabase){
    const [totalRes,readyRes,pendingRes,pendingRows,ordersRes,customerRes,adsRes,deliveryRes]=await Promise.all([
      supabase.from("products").select("id",{count:"exact",head:true}).neq("status","archived"),
      supabase.from("products").select("id",{count:"exact",head:true}).eq("status","active").eq("is_available",true).not("selling_price_egp","is",null),
      supabase.from("products").select("id",{count:"exact",head:true}).neq("status","archived").is("selling_price_egp",null),
      supabase.from("products").select("source_name").neq("status","archived").is("selling_price_egp",null).order("source_row_no").limit(6),
      supabase.from("orders").select("id",{count:"exact",head:true}),
      supabase.from("profiles").select("id",{count:"exact",head:true}),
      supabase.from("homepage_banners").select("id",{count:"exact",head:true}),
      supabase.from("delivery_rules").select("fee_egp,universities(name_en)").eq("rule_type","university").eq("is_active",true).order("priority",{ascending:false}),
    ]);
    total=totalRes.count??total;publicReady=readyRes.count??0;pendingCount=pendingRes.count??0;pending=(pendingRows.data||[]) as PendingRow[];orders=ordersRes.count??0;customers=customerRes.count??0;adCount=adsRes.count??0;
    for(const row of (deliveryRes.data||[]) as unknown as DeliveryRow[]){const rel=Array.isArray(row.universities)?row.universities[0]:row.universities;if(rel?.name_en==="Alamein International University"){aiuFee=Number(row.fee_egp);break;}}
  }
  const pct=total?Math.round(publicReady/total*100):0;
  return <>
    <div className="admin-pagehead"><div><span className="admin-kicker">OVERVIEW</span><h1>DENTO HUB Admin</h1><p>Live Supabase insights and storefront controls in one place.</p></div><Link className="admin-primary" href="/admin/products">Review catalog <ArrowUpRight size={16}/></Link></div>
    <div className="kpi-grid"><div className="kpi"><span><Package/>Catalog rows</span><b>{total}</b><small>{publicReady} currently publishable</small></div><div className="kpi"><span><AlertTriangle/>Pending prices</span><b>{pendingCount}</b><small className="warn-text">Private - Admin only</small></div><div className="kpi"><span><ShoppingBag/>Orders</span><b>{orders}</b><small>Live database count</small></div><div className="kpi"><span><Users/>Customers</span><b>{customers}</b><small>Registered profiles</small></div></div>
    <div className="dashboard-grid"><section className="dashboard-card"><div className="dash-title"><div><h3>Catalog insights</h3><p>Unpriced products stay private and never become storefront ads.</p></div><Link href="/admin/products" className="tiny-link">Open catalog</Link></div><div className="insight-meter"><div><span>Public-ready products</span><b>{publicReady} / {total}</b></div><div className="progress"><i style={{width:`${pct}%`}}/></div></div><div className="pending-queue">{pending.map((p,i)=><div key={`${p.source_name}-${i}`}><span className="pending-dot"/><div><b>{titleCaseSource(p.source_name||"Unnamed product")}</b><small>Needs storefront selling price</small></div><Link href={`/admin/products?q=${encodeURIComponent(p.source_name||"")}`}>Set price</Link></div>)}</div></section>
    <section className="dashboard-card"><div className="dash-title"><div><h3>Store controls</h3><p>These values are read directly from Supabase.</p></div></div><div className="ops-list"><div><span className="ops-icon"><ImageIcon/></span><div><b>Ads & placements</b><small>Create, edit, hide or delete</small></div><strong>{adCount}</strong></div><div><span className="ops-icon"><Truck/></span><div><b>AIU campus delivery</b><small>Editable university override</small></div><strong>{aiuFee===null?"Not set":`${aiuFee} EGP`}</strong></div><div><span className="ops-icon"><Eye/></span><div><b>Public catalog</b><small>Available, active and priced</small></div><strong>{publicReady}</strong></div></div></section></div>
    <div className="dashboard-grid lower-dashboard"><section className="dashboard-card"><div className="dash-title"><div><h3>Account persistence</h3><p>Signed-in customer data is tied to their Supabase user.</p></div></div><div className="launch-list"><div className="done"><span>✓</span><div><b>Profiles</b><small>Name, phone, university and academic year</small></div></div><div className="done"><span>✓</span><div><b>Cart sync</b><small>Guest cart merges into the signed-in account</small></div></div><div className="done"><span>✓</span><div><b>Wishlist sync</b><small>Saved across sessions and devices</small></div></div><div><span>4</span><div><b>Addresses & orders</b><small>Database tables are ready for checkout activation</small></div></div></div></section><section className="dashboard-card"><div className="dash-title"><div><h3>Operations</h3><p>Live control center.</p></div></div><div className="ops-list"><div><span className="ops-icon"><Clock3/></span><div><b>Orders</b><small>All order states</small></div><strong>{orders}</strong></div><div><span className="ops-icon"><CircleCheck/></span><div><b>Catalog data</b><small>Supabase-backed product controls</small></div><strong>Live</strong></div><div><span className="ops-icon"><CircleDollarSign/></span><div><b>Revenue</b><small>Appears once checkout is activated</small></div><strong>—</strong></div></div></section></div>
  </>;
}
