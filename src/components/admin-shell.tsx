"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, Layers3, BookOpen, Boxes, BadgePercent, ImageIcon, Truck, GraduationCap, Users, Bell, Settings, Search, ExternalLink, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AdminTopControls } from "./admin-top-controls";

const nav=[
 ["/admin",LayoutDashboard,"Dashboard & Insights"],["/admin/orders",ShoppingBag,"Orders"],["/admin/products",Package,"Products"],["/admin/categories",Layers3,"Categories"],["/admin/courses",BookOpen,"Courses"],["/admin/bundles",Boxes,"Bundles"],["/admin/promotions",BadgePercent,"Promotions"],["/admin/banners",ImageIcon,"Ads & Banners"],["/admin/delivery",Truck,"Delivery"],["/admin/universities",GraduationCap,"Universities"],["/admin/customers",Users,"Customers"],["/admin/notifications",Bell,"Notifications"],["/admin/settings",Settings,"Settings"]
] as const;

export function AdminShell({children}:{children:React.ReactNode}){
 const path=usePathname();
 async function signOut(){
   const supabase=createClient();
   if(supabase) await supabase.auth.signOut();
   window.location.replace("/");
 }
 return <div className="admin-app">
   <aside className="admin-sidebar">
     <Link href="/admin" className="brand admin-brand brand-logo-link" aria-label="DENTO HUB admin"><img className="admin-logo-img admin-logo-full" src="/dento-hub-logo.png" alt="DENTO HUB" /><img className="admin-logo-img admin-logo-symbol" src="/dento-hub-tooth.png" alt="" aria-hidden="true" /></Link>
     <div className="admin-sidebar-label">ADMIN CONTROL CENTER</div>
     <nav>{nav.map(([href,Icon,label])=><Link href={href} key={href} className={path===href?"active":""}><Icon size={18}/>{label}</Link>)}</nav>
     <div className="admin-help"><b>Catalog review</b><span>Pending items stay private</span><div className="admin-progress"><i style={{width:"71%"}}/></div><small>Use Products to finish prices and visibility.</small></div>
     <div className="admin-sidebar-bottom">
       <Link href="/" className="admin-view-store"><ExternalLink size={16}/> View storefront</Link>
       <button onClick={signOut}><LogOut size={16}/> Sign out</button>
     </div>
   </aside>
   <main className="admin-main">
     <header className="admin-top">
       <div className="admin-search"><Search size={17}/><input placeholder="Search orders, products, customers..."/></div>
       <AdminTopControls/>
     </header>
     <div className="admin-content">{children}</div>
   </main>
 </div>
}
