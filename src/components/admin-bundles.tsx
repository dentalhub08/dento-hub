"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  ImageIcon,
  Loader2,
  PackagePlus,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadAdminImage } from "@/lib/admin-media";

type Product = {
  id: string;
  name: string;
  price: number | null;
  available: boolean;
  status: string;
};

type Course = { id: string; name_en: string };

type BundleItem = {
  productId: string;
  quantity: number;
};

type BundleEditor = {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number | null;
  image: string;
  isAvailable: boolean;
  isActive: boolean;
  isFeatured: boolean;
  items: BundleItem[];
  courseIds: string[];
  academicYears: number[];
};

type DbBundle = {
  id: string;
  name_en: string;
  name_ar: string | null;
  slug: string;
  description_en: string | null;
  description_ar: string | null;
  price_egp: number | string;
  image_storage_path: string | null;
  is_available: boolean;
  is_active: boolean;
  is_featured: boolean;
};

type DbBundleItem = {
  bundle_id: string;
  product_id: string;
  quantity: number;
};

type DbBundleCourse = { bundle_id: string; course_id: string };
type DbBundleYear = { bundle_id: string; academic_year: number };

const emptyBundle: BundleEditor = {
  id: "",
  nameEn: "",
  nameAr: "",
  slug: "",
  descriptionEn: "",
  descriptionAr: "",
  price: null,
  image: "",
  isAvailable: true,
  isActive: true,
  isFeatured: false,
  items: [],
  courseIds: [],
  academicYears: [],
};

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `bundle-${Date.now()}`
  );
}

export function AdminBundles() {
  const [bundles, setBundles] = useState<BundleEditor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [editing, setEditing] = useState<BundleEditor | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      setMessage("Supabase is not configured.");
      return;
    }

    setLoading(true);
    setMessage("");

    const [bundleResult, itemResult, courseLinkResult, yearResult, productResult, coursesResult] =
      await Promise.all([
        supabase
          .from("bundles")
          .select("id,name_en,name_ar,slug,description_en,description_ar,price_egp,image_storage_path,is_available,is_active,is_featured")
          .order("created_at", { ascending: false }),
        supabase.from("bundle_items").select("bundle_id,product_id,quantity"),
        supabase.from("bundle_courses").select("bundle_id,course_id"),
        supabase.from("bundle_academic_years").select("bundle_id,academic_year"),
        supabase
          .from("products")
          .select("id,source_name,canonical_name_en,selling_price_egp,is_available,status")
          .neq("status", "archived")
          .order("source_row_no", { ascending: true }),
        supabase.from("courses").select("id,name_en").eq("is_active", true).order("name_en"),
      ]);

    const firstError =
      bundleResult.error ||
      itemResult.error ||
      courseLinkResult.error ||
      yearResult.error ||
      productResult.error ||
      coursesResult.error;

    if (firstError) {
      setMessage(`${firstError.message} — Run migration 005_admin_media_bundles.sql if you have not run it yet.`);
      setBundles([]);
      setLoading(false);
      return;
    }

    const productRows = (productResult.data || []) as Array<{
      id: string;
      source_name: string | null;
      canonical_name_en: string | null;
      selling_price_egp: number | string | null;
      is_available: boolean;
      status: string;
    }>;

    setProducts(
      productRows.map((row) => ({
        id: row.id,
        name: row.canonical_name_en || row.source_name || "Unnamed product",
        price: row.selling_price_egp === null ? null : Number(row.selling_price_egp),
        available: row.is_available,
        status: row.status,
      }))
    );

    setCourses((coursesResult.data || []) as Course[]);

    const itemRows = (itemResult.data || []) as DbBundleItem[];
    const courseRows = (courseLinkResult.data || []) as DbBundleCourse[];
    const yearRows = (yearResult.data || []) as DbBundleYear[];

    setBundles(
      ((bundleResult.data || []) as DbBundle[]).map((bundle) => ({
        id: bundle.id,
        nameEn: bundle.name_en,
        nameAr: bundle.name_ar || "",
        slug: bundle.slug,
        descriptionEn: bundle.description_en || "",
        descriptionAr: bundle.description_ar || "",
        price: Number(bundle.price_egp),
        image: bundle.image_storage_path || "",
        isAvailable: bundle.is_available,
        isActive: bundle.is_active,
        isFeatured: bundle.is_featured,
        items: itemRows
          .filter((item) => item.bundle_id === bundle.id)
          .map((item) => ({ productId: item.product_id, quantity: Number(item.quantity || 1) })),
        courseIds: courseRows
          .filter((link) => link.bundle_id === bundle.id)
          .map((link) => link.course_id),
        academicYears: yearRows
          .filter((link) => link.bundle_id === bundle.id)
          .map((link) => Number(link.academic_year)),
      }))
    );

    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );

  const searchedProducts = useMemo(() => {
    const needle = productSearch.trim().toLowerCase();
    return products
      .filter((product) => !needle || product.name.toLowerCase().includes(needle))
      .slice(0, 40);
  }, [products, productSearch]);

  function normalTotal(bundle: BundleEditor) {
    return bundle.items.reduce((sum, item) => {
      const price = productById.get(item.productId)?.price;
      return sum + (price === null || price === undefined ? 0 : price * item.quantity);
    }, 0);
  }

  function addProduct(productId: string) {
    if (!editing) return;
    const existing = editing.items.find((item) => item.productId === productId);
    if (existing) {
      setEditing({
        ...editing,
        items: editing.items.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        ),
      });
    } else {
      setEditing({ ...editing, items: [...editing.items, { productId, quantity: 1 }] });
    }
  }

  function setQuantity(productId: string, value: number) {
    if (!editing) return;
    const quantity = Math.max(1, Math.floor(Number(value) || 1));
    setEditing({
      ...editing,
      items: editing.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    });
  }

  function removeProduct(productId: string) {
    if (!editing) return;
    setEditing({
      ...editing,
      items: editing.items.filter((item) => item.productId !== productId),
    });
  }

  async function upload(file: File) {
    const supabase = createClient();
    if (!supabase || !editing) return;

    setUploading(true);
    setMessage("");

    try {
      const { publicUrl } = await uploadAdminImage(supabase, file, "bundles");
      setEditing((current) => (current ? { ...current, image: publicUrl } : current));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void upload(file);
  }

  function toggleCourse(courseId: string) {
    if (!editing) return;
    setEditing({
      ...editing,
      courseIds: editing.courseIds.includes(courseId)
        ? editing.courseIds.filter((id) => id !== courseId)
        : [...editing.courseIds, courseId],
    });
  }

  function toggleYear(year: number) {
    if (!editing) return;
    setEditing({
      ...editing,
      academicYears: editing.academicYears.includes(year)
        ? editing.academicYears.filter((value) => value !== year)
        : [...editing.academicYears, year],
    });
  }

  async function save() {
    if (!editing) return;
    if (!editing.nameEn.trim()) {
      setMessage("Bundle name is required.");
      return;
    }
    if (editing.price === null || Number(editing.price) < 0) {
      setMessage("Enter a valid bundle price.");
      return;
    }
    if (editing.items.length === 0) {
      setMessage("Add at least one product to the bundle.");
      return;
    }

    const supabase = createClient();
    if (!supabase) return;

    setSaving(true);
    setMessage("");

    const containsUnavailable = editing.items.some((item) => {
      const product = productById.get(item.productId);
      return !product || !product.available || product.price === null;
    });

    const payload = {
      name_en: editing.nameEn.trim(),
      name_ar: editing.nameAr.trim() || null,
      slug: editing.slug.trim() || slugify(editing.nameEn),
      description_en: editing.descriptionEn.trim() || null,
      description_ar: editing.descriptionAr.trim() || null,
      price_egp: Number(editing.price),
      image_storage_path: editing.image || null,
      is_available: editing.isAvailable && !containsUnavailable,
      is_active: editing.isActive,
      is_featured: editing.isFeatured,
      updated_at: new Date().toISOString(),
    };

    let bundleId = editing.id;

    if (bundleId) {
      const { error } = await supabase.from("bundles").update(payload).eq("id", bundleId);
      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { data, error } = await supabase.from("bundles").insert(payload).select("id").single();
      if (error || !data) {
        setMessage(error?.message || "Could not create bundle.");
        setSaving(false);
        return;
      }
      bundleId = String(data.id);
    }

    const deleteResults = await Promise.all([
      supabase.from("bundle_items").delete().eq("bundle_id", bundleId),
      supabase.from("bundle_courses").delete().eq("bundle_id", bundleId),
      supabase.from("bundle_academic_years").delete().eq("bundle_id", bundleId),
    ]);

    const deleteError = deleteResults.find((result) => result.error)?.error;
    if (deleteError) {
      setMessage(deleteError.message);
      setSaving(false);
      return;
    }

    const itemPayload = editing.items.map((item, index) => ({
      bundle_id: bundleId,
      product_id: item.productId,
      variation_id: null,
      quantity: item.quantity,
      sort_order: index,
    }));

    const inserts = [
      supabase.from("bundle_items").insert(itemPayload),
      editing.courseIds.length
        ? supabase.from("bundle_courses").insert(
            editing.courseIds.map((courseId) => ({ bundle_id: bundleId, course_id: courseId }))
          )
        : Promise.resolve({ error: null }),
      editing.academicYears.length
        ? supabase.from("bundle_academic_years").insert(
            editing.academicYears.map((academicYear) => ({
              bundle_id: bundleId,
              academic_year: academicYear,
            }))
          )
        : Promise.resolve({ error: null }),
    ];

    const insertResults = await Promise.all(inserts);
    const insertError = insertResults.find((result) => result.error)?.error;

    if (insertError) {
      setMessage(insertError.message);
      setSaving(false);
      return;
    }

    setEditing(null);
    setProductSearch("");
    await load();
    window.dispatchEvent(new Event("dento-bundles-updated"));
    setSaving(false);
  }

  async function removeBundle(id: string) {
    if (!window.confirm("Delete this bundle and its item links?")) return;
    const supabase = createClient();
    if (!supabase) return;

    const { error } = await supabase.from("bundles").delete().eq("id", id);
    if (error) setMessage(error.message);
    else await load();
  }

  return (
    <>
      <div className="admin-pagehead">
        <div>
          <span className="admin-kicker">STUDENT KITS</span>
          <h1>Bundles</h1>
          <p>Create package deals from existing products, set quantities and a bundle price, and upload package artwork.</p>
        </div>
        <button className="admin-primary" onClick={() => setEditing({ ...emptyBundle, items: [], courseIds: [], academicYears: [] })}>
          <PackagePlus size={16} /> Create bundle
        </button>
      </div>

      {message && (
        <div className="admin-alert">
          <div>
            <b>Bundle message</b>
            <span>{message}</span>
          </div>
        </div>
      )}

      <div className="admin-table-card">
        <div className="dento-bundle-list">
          {loading ? (
            <div className="dento-empty"><Loader2 className="spin" /> Loading bundles…</div>
          ) : bundles.length === 0 ? (
            <div className="dento-empty">
              <PackagePlus />
              <b>No bundles yet</b>
              <span>Create a student kit from your existing catalog.</span>
            </div>
          ) : (
            bundles.map((bundle) => {
              const individualTotal = normalTotal(bundle);
              const savings = Math.max(0, individualTotal - Number(bundle.price || 0));

              return (
                <article className="dento-bundle-row" key={bundle.id}>
                  <div className="dento-bundle-thumb">
                    {bundle.image ? <img src={bundle.image} alt="" /> : <ImageIcon />}
                  </div>

                  <div className="dento-bundle-copy">
                    <div>
                      <b>{bundle.nameEn}</b>
                      <span className={`badge ${bundle.isActive && bundle.isAvailable ? "success" : "warning"}`}>
                        {bundle.isActive && bundle.isAvailable ? "Live" : "Hidden"}
                      </span>
                    </div>
                    <p>{bundle.items.length} product{bundle.items.length === 1 ? "" : "s"} • {Number(bundle.price || 0).toFixed(2)} EGP</p>
                    <small>
                      Individual total: {individualTotal.toFixed(2)} EGP
                      {savings > 0 ? ` • Customer saves ${savings.toFixed(2)} EGP` : ""}
                    </small>
                  </div>

                  <div className="dento-row-actions">
                    <button className="icon-admin-btn" title="Edit" onClick={() => setEditing({
                      ...bundle,
                      items: bundle.items.map((item) => ({ ...item })),
                      courseIds: [...bundle.courseIds],
                      academicYears: [...bundle.academicYears],
                    })}>
                      <Pencil />
                    </button>
                    <button className="icon-admin-btn danger" title="Delete" onClick={() => void removeBundle(bundle.id)}>
                      <Trash2 />
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {editing && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal dento-bundle-modal">
            <div className="admin-modal-head">
              <div>
                <span className="admin-kicker">BUNDLE EDITOR</span>
                <h2>{editing.id ? "Edit bundle" : "Create bundle"}</h2>
              </div>
              <button onClick={() => setEditing(null)}><X /></button>
            </div>

            <div className="dento-bundle-editor">
              <section className="dento-form-stack">
                <label>
                  Bundle name — English
                  <input
                    value={editing.nameEn}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        nameEn: e.target.value,
                        slug: editing.id || editing.slug ? editing.slug : slugify(e.target.value),
                      })
                    }
                  />
                </label>

                <label>
                  Bundle name — Arabic
                  <input dir="rtl" value={editing.nameAr} onChange={(e) => setEditing({ ...editing, nameAr: e.target.value })} />
                </label>

                <label>
                  Slug
                  <input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} />
                </label>

                <label>
                  Description — English
                  <textarea value={editing.descriptionEn} onChange={(e) => setEditing({ ...editing, descriptionEn: e.target.value })} />
                </label>

                <label>
                  Description — Arabic
                  <textarea dir="rtl" value={editing.descriptionAr} onChange={(e) => setEditing({ ...editing, descriptionAr: e.target.value })} />
                </label>

                <label>
                  Bundle price (EGP)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editing.price ?? ""}
                    onChange={(e) => setEditing({ ...editing, price: e.target.value === "" ? null : Number(e.target.value) })}
                  />
                </label>

                <div className="dento-toggle-grid">
                  <label className="dento-checkbox">
                    <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} />
                    <span>Active</span>
                  </label>
                  <label className="dento-checkbox">
                    <input type="checkbox" checked={editing.isAvailable} onChange={(e) => setEditing({ ...editing, isAvailable: e.target.checked })} />
                    <span>Available</span>
                  </label>
                  <label className="dento-checkbox">
                    <input type="checkbox" checked={editing.isFeatured} onChange={(e) => setEditing({ ...editing, isFeatured: e.target.checked })} />
                    <span>Featured</span>
                  </label>
                </div>

                <div className="dento-choice-block">
                  <b>Course targeting</b>
                  <div className="dento-chip-options">
                    {courses.map((course) => (
                      <button
                        type="button"
                        key={course.id}
                        className={editing.courseIds.includes(course.id) ? "selected" : ""}
                        onClick={() => toggleCourse(course.id)}
                      >
                        {course.name_en}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="dento-choice-block">
                  <b>Academic years</b>
                  <div className="dento-chip-options">
                    {[1, 2, 3, 4, 5].map((year) => (
                      <button
                        type="button"
                        key={year}
                        className={editing.academicYears.includes(year) ? "selected" : ""}
                        onClick={() => toggleYear(year)}
                      >
                        Year {year}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="dento-bundle-products">
                <div className="dento-upload-panel compact">
                  <b>Bundle package image</b>
                  <div className="dento-upload-preview bundle">
                    {editing.image ? <img src={editing.image} alt="Bundle preview" /> : <ImageIcon />}
                  </div>
                  <label className={`dento-upload-button ${uploading ? "disabled" : ""}`}>
                    {uploading ? <Loader2 className="spin" size={17} /> : <UploadCloud size={17} />}
                    {uploading ? "Uploading…" : "Upload package image"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      hidden
                      disabled={uploading}
                      onChange={onFile}
                    />
                  </label>
                  {editing.image && (
                    <button type="button" className="admin-secondary" onClick={() => setEditing({ ...editing, image: "" })}>
                      Remove image
                    </button>
                  )}
                </div>

                <div className="dento-selected-products">
                  <div className="dento-section-title">
                    <div>
                      <b>Included products</b>
                      <small>{editing.items.length} selected</small>
                    </div>
                    <strong>{normalTotal(editing).toFixed(2)} EGP normal total</strong>
                  </div>

                  {editing.items.length === 0 ? (
                    <div className="dento-mini-empty">Choose products below.</div>
                  ) : (
                    editing.items.map((item) => {
                      const product = productById.get(item.productId);
                      return (
                        <div className="dento-selected-row" key={item.productId}>
                          <div>
                            <b>{product?.name || "Product"}</b>
                            <small>
                              {product?.price === null || product?.price === undefined
                                ? "Price pending"
                                : `${product.price.toFixed(2)} EGP each`}
                              {!product?.available ? " • Unavailable" : ""}
                            </small>
                          </div>
                          <label>
                            Qty
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
                            />
                          </label>
                          <button type="button" className="icon-admin-btn danger" onClick={() => removeProduct(item.productId)}>
                            <Trash2 />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="dento-product-picker">
                  <div className="admin-search boxed">
                    <Search size={16} />
                    <input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products to add..."
                    />
                  </div>

                  <div className="dento-product-results">
                    {searchedProducts.map((product) => {
                      const selected = editing.items.some((item) => item.productId === product.id);
                      return (
                        <button type="button" key={product.id} onClick={() => addProduct(product.id)}>
                          <span>
                            <b>{product.name}</b>
                            <small>
                              {product.price === null ? "Price pending" : `${product.price.toFixed(2)} EGP`}
                              {!product.available ? " • unavailable" : ""}
                            </small>
                          </span>
                          <span>{selected ? "Add another" : <><Plus size={14} /> Add</>}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>

            <div className="admin-modal-footer">
              <button className="admin-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="admin-primary" disabled={saving || uploading} onClick={() => void save()}>
                {saving ? <Loader2 className="spin" size={15} /> : <Save size={15} />}
                Save bundle
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
