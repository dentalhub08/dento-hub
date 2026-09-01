"use client";
import Link from "next/link";
import { Heart, ArrowUpRight } from "lucide-react";
import { StagedProduct } from "@/data/catalog";
import { titleCaseSource, egp } from "@/lib/format";
import { useStore } from "./store-provider";

export function ProductCard({ product, index=0 }: { product: StagedProduct; index?: number }) {
  const { wishlist, toggleWishlist, addToCart, locale } = useStore();
  const id=String(product.id), saved=wishlist.includes(id), ar=locale==="ar";
  const tones=["product-a","product-b","product-c","product-d","product-e"];
  const name=titleCaseSource(product.sourceName);
  if(product.sellingPrice===null || product.status!=="active") return null;
  return <article className="product-card">
    <div className={`product-visual ${tones[index%tones.length]} ${product.image?"has-photo":""}`}>
      {product.image?<img className="product-photo" src={product.image} alt={name}/>:<span className="product-initial">{name.slice(0,2).toUpperCase()}</span>}
      <button aria-label="Save product" className={`heart-btn ${saved?"saved":""}`} onClick={()=>toggleWishlist(id)}><Heart size={18} fill={saved?"currentColor":"none"}/></button>
      <span className="draft-chip approved">{ar?"متاح":"Available"}</span>
    </div>
    <div className="product-body">
      <p className="eyebrow">{product.sourceName.toLowerCase().includes("bur")?"Dental burs":"Student supplies"}</p>
      <Link href={`/products/${product.slug}`} className="product-name">{name}</Link>
      <div className="price-line"><strong>{egp(product.sellingPrice)}</strong></div>
      <div className="product-actions">
        <Link href={`/products/${product.slug}`} className="ghost-small">{ar?"التفاصيل":"Details"}<ArrowUpRight size={15}/></Link>
        <button className="add-small" onClick={()=>addToCart({id,name,price:product.sellingPrice!})}>{ar?"أضف":"Add"}</button>
      </div>
    </div>
  </article>
}
