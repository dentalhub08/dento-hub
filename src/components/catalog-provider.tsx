"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { publicProducts, StagedProduct } from "@/data/catalog";
import { productImageById } from "@/data/product-media";
import { createClient } from "@/lib/supabase/client";

type CatalogContextValue = {
  products: StagedProduct[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

type DbProduct = {
  source_row_no: number | null;
  source_name: string | null;
  slug: string;
  source_togary_price_raw: string | null;
  selling_price_egp: number | string | null;
  status: "draft" | "active" | "archived";
  is_available: boolean;
  product_courses?: Array<{ courses?: { slug: string } | { slug: string }[] | null }> | null;
};

function mapDbProduct(row: DbProduct): StagedProduct | null {
  if (!row.source_row_no || !row.source_name || row.selling_price_egp === null || row.status !== "active" || !row.is_available) {
    return null;
  }
  return {
    id: row.source_row_no,
    sourceName: row.source_name,
    slug: row.slug,
    sourceTogary: row.source_togary_price_raw,
    sellingPrice: Number(row.selling_price_egp),
    status: "active",
    image: productImageById[row.source_row_no],
    courseSlugs: (row.product_courses || []).flatMap((link) => {
      const relation = Array.isArray(link.courses) ? link.courses[0] : link.courses;
      return relation?.slug ? [relation.slug] : [];
    }),
  };
}

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<StagedProduct[]>(publicProducts);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) {
      setProducts(publicProducts);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("source_row_no,source_name,slug,source_togary_price_raw,selling_price_egp,status,is_available,product_courses(courses(slug))")
      .eq("status", "active")
      .eq("is_available", true)
      .not("selling_price_egp", "is", null)
      .order("source_row_no", { ascending: true });

    if (!error && data) {
      const mapped = (data as DbProduct[]).map(mapDbProduct).filter(Boolean) as StagedProduct[];
      setProducts(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const onUpdate = () => void refresh();
    window.addEventListener("dento-catalog-updated", onUpdate);
    window.addEventListener("focus", onUpdate);
    return () => {
      window.removeEventListener("dento-catalog-updated", onUpdate);
      window.removeEventListener("focus", onUpdate);
    };
  }, [refresh]);

  const value = useMemo(() => ({ products, loading, refresh }), [products, loading, refresh]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) throw new Error("useCatalog must be used inside CatalogProvider");
  return value;
}
