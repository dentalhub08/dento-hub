"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Search, ShoppingBag, Menu } from "lucide-react";
import { useStore } from "./store-provider";
import { LocationPicker } from "./location-picker";
import { AuthAccountMenu } from "./auth-account-menu";

export function Header() {
  const pathname = usePathname();
  const { locale, setLocale, cartCount } = useStore();
  const ar = locale === "ar";

  if (pathname.startsWith("/admin")) return null;

  return <>
    <div className="topbar">
      <div className="shell topbar-inner">
        <span>{ar ? "توصيل مرن في جميع أنحاء مصر" : "Flexible delivery across Egypt"}</span>
        <span className="topbar-right">{ar ? "الدفع عند الاستلام" : "Cash on delivery"} · {ar ? "دعم الطلاب" : "Student support"}</span>
      </div>
    </div>
    <header className="site-header">
      <div className="shell header-row">
        <Link href="/shop" className="icon-btn mobile-only mobile-shop-link" aria-label="Open shop"><Menu size={21}/></Link>
        <Link href="/" className="brand brand-logo-link" aria-label="DENTO HUB home">
          <img className="brand-logo-img" src="/dento-hub-logo.png" alt="DENTO HUB — Your Dental Supply Hub" />
        </Link>
        <form className="searchbar" action="/shop">
          <Search size={20}/>
          <input name="q" placeholder={ar ? "ابحث عن الأدوات، المواد، الكورس..." : "Search instruments, materials, courses..."}/>
          <kbd>⌘ K</kbd>
        </form>
        <nav className="header-actions">
          <button className="lang-btn" onClick={() => setLocale(ar ? "en" : "ar")}>{ar ? "EN" : "عربي"}</button>
          <Link href="/wishlist" className="icon-link" aria-label="Wishlist"><Heart size={21}/></Link>
          <AuthAccountMenu arabic={ar} />
          <Link href="/cart" className="cart-link"><ShoppingBag size={22}/>{cartCount > 0 && <b>{cartCount}</b>}</Link>
        </nav>
      </div>
      <div className="shell category-nav">
        <Link href="/shop">{ar ? "تسوق الكل" : "Shop all"}</Link>
        <Link href="/shop?course=operative">{ar ? "العلاج التحفظي" : "Operative"}</Link>
        <Link href="/shop?course=endo">{ar ? "علاج الجذور" : "Endodontics"}</Link>
        <Link href="/shop?course=fixed">{ar ? "التركيبات الثابتة" : "Fixed Prostho"}</Link>
        <Link href="/shop?course=removable">{ar ? "التركيبات المتحركة" : "Removable"}</Link>
        <Link href="/shop?bundles=1" className="accent-nav">{ar ? "حقائب الطلاب" : "Student kits"}</Link>
        <span className="nav-spacer"/>
        <LocationPicker/>
      </div>
    </header>
  </>;
}
