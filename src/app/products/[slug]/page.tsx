import { notFound } from "next/navigation";
import Link from "next/link";
import { publicProducts } from "@/data/catalog";
import { productImageById } from "@/data/product-media";
import { titleCaseSource, egp } from "@/lib/format";
import { ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { ProductPurchase } from "@/components/product-purchase";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export async function generateStaticParams() { return publicProducts.map((p) => ({ slug: p.slug })); }

type ProductImageRelation = { storage_path: string; is_primary: boolean | null; sort_order: number | null };

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  let p: { id: number; sourceName: string; slug: string; sellingPrice: number; image?: string } | null = null;

  if (supabase) {
    const { data } = await supabase.from("products")
      .select("source_row_no,source_name,slug,selling_price_egp,status,is_available,suppress_default_image,product_images(storage_path,is_primary,sort_order)")
      .eq("slug", slug)
      .eq("status", "active")
      .eq("is_available", true)
      .not("selling_price_egp", "is", null)
      .maybeSingle();

    if (!data || !data.source_row_no || !data.source_name || data.selling_price_egp === null) notFound();

    const images = [...(((data.product_images || []) as unknown) as ProductImageRelation[])].sort((a, b) => {
      if (Boolean(a.is_primary) !== Boolean(b.is_primary)) return a.is_primary ? -1 : 1;
      return Number(a.sort_order || 0) - Number(b.sort_order || 0);
    });
    const path = images[0]?.storage_path;
    const customUrl = path ? supabase.storage.from("dento-media").getPublicUrl(path).data.publicUrl : undefined;
    const fallback = !data.suppress_default_image ? productImageById[data.source_row_no] : undefined;

    p = {
      id: data.source_row_no,
      sourceName: data.source_name,
      slug: data.slug,
      sellingPrice: Number(data.selling_price_egp),
      image: customUrl || fallback,
    };
  } else {
    const fallback = publicProducts.find((x) => x.slug === slug);
    if (!fallback || fallback.sellingPrice === null) notFound();
    p = { id: fallback.id, sourceName: fallback.sourceName, slug: fallback.slug, sellingPrice: fallback.sellingPrice, image: fallback.image };
  }

  const name = titleCaseSource(p.sourceName);
  return <main className="shell product-page">
    <div className="breadcrumbs"><Link href="/">Home</Link> / <Link href="/shop">Products</Link> / {name}</div>
    <div className="product-detail">
      <div className="detail-gallery">
        <div className={`detail-main ${p.image ? "has-photo" : ""}`}>{p.image ? <img src={p.image} alt={name}/> : <span>{name.slice(0, 2)}</span>}</div>
        <div className="pdf-source-note">Product image is managed by DENTO HUB Admin when a custom image is uploaded.</div>
      </div>
      <div className="detail-info">
        <span className="badge success">Available</span><h1>{name}</h1><p className="source-line">DENTO HUB catalog item</p>
        <div className="detail-price"><strong>{egp(p.sellingPrice)}</strong><p>Current DENTO HUB selling price.</p></div>
        <div className="variant-box"><label>Variation</label><button className="variant selected">Standard</button></div>
        <ProductPurchase id={String(p.id)} name={name} price={p.sellingPrice}/>
        <div className="detail-benefits">
          <div><Truck/><span><b>Egypt delivery</b><small>Calculated from your address/university</small></span></div>
          <div><ShieldCheck/><span><b>Verified checkout</b><small>Prices recalculated server-side</small></span></div>
          <div><RotateCcw/><span><b>Order cancellation</b><small>Direct cancellation for the first hour while pending</small></span></div>
        </div>
      </div>
    </div>
  </main>;
}
