"use client";
import { useStore } from "@/components/store-provider";
import { useCatalog } from "@/components/catalog-provider";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";
export default function Wishlist(){const {wishlist}=useStore(); const {products}=useCatalog(); const p=products.filter(x=>wishlist.includes(String(x.id))); return <main className="shell simple-page"><span className="section-kicker">SAVED</span><h1>Your wishlist</h1>{p.length?<div className="product-grid">{p.map((x,i)=><ProductCard key={x.id} product={x} index={i}/>)}</div>:<div className="simple-empty"><p>Save products here while you build your semester list. Signed-in wishlists are saved to your DENTO HUB account.</p><Link href="/shop" className="btn-primary">Browse supplies</Link></div>}</main>}
