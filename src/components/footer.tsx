"use client";
import Link from "next/link";
import { Mail, MessageCircle, ArrowUpRight } from "lucide-react";
import { useStore } from "./store-provider";

export function Footer(){
 const { locale } = useStore(); const ar=locale==="ar";
 return <footer className="footer">
   <div className="shell footer-grid">
     <div className="footer-brand"><Link href="/" className="brand footer-logo brand-logo-link" aria-label="DENTO HUB home"><img className="footer-logo-img" src="/dento-hub-logo.png" alt="DENTO HUB — Your Dental Supply Hub" /></Link><p>{ar?"كل ما يحتاجه طالب طب الأسنان، في مكان واحد.":"Everything a dental student needs, in one focused hub."}</p></div>
     <div><h4>{ar?"تسوق":"Shop"}</h4><Link href="/shop">All products</Link><Link href="/shop?course=endo">Endodontics</Link><Link href="/shop?course=operative">Operative</Link><Link href="/shop?bundles=1">Student kits</Link></div>
     <div><h4>{ar?"المساعدة":"Help"}</h4><Link href="/contact">Contact</Link><Link href="/about">About DENTO HUB</Link><Link href="/account/orders">Track order</Link></div>
     <div><h4>{ar?"تواصل معنا":"Need help?"}</h4><a href="mailto:dentalhub08@outlook.com"><Mail size={16}/> dentalhub08@outlook.com</a><span className="muted-link"><MessageCircle size={16}/> WhatsApp number coming soon</span></div>
   </div>
   <div className="shell footer-bottom"><span>© 2026 DENTO HUB</span><span>Built for dental students in Egypt <ArrowUpRight size={14}/></span></div>
 </footer>
}
