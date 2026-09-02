"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "./product-card";
import { titleCaseSource } from "@/lib/format";
import { ManagedAds } from "./managed-ads";
import { AdCourse } from "@/data/banners";
import { useCatalog } from "./catalog-provider";

const courseSlug: Record<Exclude<AdCourse, "all">, string> = {
  operative: "operative-dentistry",
  endo: "endodontics",
  fixed: "fixed-prosthodontics",
  removable: "removable-prosthodontics",
};

export function ShopClient({
  initialQuery = "",
  initialCourse = "all",
}: {
  initialQuery?: string;
  initialCourse?: AdCourse;
}) {
  const [q, setQ] = useState(initialQuery);
  const [limit, setLimit] = useState(24);
  const [course, setCourse] = useState<AdCourse>(initialCourse);
  const { products } = useCatalog();

  // App Router can preserve this client component while only search params change.
  // Keep local state synchronized so header links such as Shop all / Operative /
  // Endodontics actually update the visible catalog.
  useEffect(() => {
    setQ(initialQuery);
    setCourse(initialCourse);
    setLimit(24);
  }, [initialQuery, initialCourse]);

  // The database currently contains the course records, but older catalog seeds
  // may not contain product_courses rows yet. Do not turn a valid 85-product
  // catalog into an empty screen in that state. As soon as mappings exist for a
  // selected course, the filter becomes strict automatically.
  const selectedCourseSlug = course === "all" ? null : courseSlug[course];
  const selectedCourseHasMappings = useMemo(() => {
    if (!selectedCourseSlug) return true;
    return products.some((product) =>
      (product.courseSlugs || []).includes(selectedCourseSlug),
    );
  }, [products, selectedCourseSlug]);

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const searchText = `${product.sourceName} ${titleCaseSource(product.sourceName)}`.toLowerCase();
        const matchesText = searchText.includes(q.trim().toLowerCase());
        const matchesCourse =
          course === "all" ||
          !selectedCourseHasMappings ||
          (product.courseSlugs || []).includes(courseSlug[course]);

        return matchesText && matchesCourse;
      }),
    [q, products, course, selectedCourseHasMappings],
  );

  return (
    <main className="shell shop-page">
      <div className="shop-hero">
        <div>
          <span className="section-kicker">CATALOG</span>
          <h1>Dental supplies, without the noise.</h1>
          <p>
            Browse the live DENTO HUB catalog. Admin price, availability and course
            changes are read from Supabase.
          </p>
        </div>
        <div className="shop-search">
          <Search size={18} />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder={`Search ${products.length} available products...`}
          />
        </div>
      </div>

      <ManagedAds placement="shop_top" course={course} />

      <div className="shop-layout">
        <aside className="filters">
          <div className="filter-title">
            <Filter size={18} /> Filters
          </div>
          <label>
            Course
            <select
              value={course}
              onChange={(event) => {
                setCourse(event.target.value as AdCourse);
                setLimit(24);
              }}
            >
              <option value="all">All courses</option>
              <option value="operative">Operative Dentistry</option>
              <option value="endo">Endodontics</option>
              <option value="fixed">Fixed Prosthodontics</option>
              <option value="removable">Removable Prosthodontics</option>
            </select>
          </label>
          <label>
            Academic year
            <select>
              <option>All years</option>
              <option>Year 1</option>
              <option>Year 2</option>
              <option>Year 3</option>
              <option>Year 4</option>
              <option>Year 5</option>
            </select>
          </label>
          <label>
            Availability
            <select>
              <option>Available products</option>
            </select>
          </label>
          <div className="filter-note">
            <b>Student-focused catalog</b>
            <p>Use course and year filters to get to the supplies you actually need.</p>
          </div>
        </aside>

        <section>
          <div className="shop-toolbar">
            <span>
              <b>{filtered.length}</b> products
            </span>
            <button>
              <SlidersHorizontal size={16} /> Sort: Recommended
            </button>
          </div>

          <div className="product-grid shop-products">
            {filtered.slice(0, limit).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          {limit < filtered.length && (
            <button className="load-more" onClick={() => setLimit((value) => value + 24)}>
              Load more products
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
