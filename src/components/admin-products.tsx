// @ts-nocheck
"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  Search, SlidersHorizontal, Plus, AlertTriangle, Upload, Pencil, Save, X,
  ImageIcon, Loader2, Archive, UploadCloud, Trash2
} from "lucide-react";
import { titleCaseSource } from "@/lib/format";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { productImageById } from "@/data/product-media";
import { uploadAdminImage } from "@/lib/admin-media";

type Course = { id: string; name_en: string; slug: string };
type EditableProduct = {
  dbId: string;
  id: number;
  sourceName: string;
  slug: string;
  sourceTogary: string | null;
  sellingPrice: number | null;
  status: "draft" | "active" | "archived";
  image?: string;
  customImagePath?: string;
  suppressDefaultImage: boolean;
  course: string;
  courseId: string | null;
  available: boolean;
};

type DbProduct = {
  id: string;
  source_row_no: number | null;
  source_name: string | null;
  slug: string;
  source_togary_price_raw: string | null;
  selling_price_egp: number | string | null;
  status: "draft" | "active" | "archived";
  is_available: boolean;
  suppress_default_image?: boolean | null;
};
type ProductCourseRow = { product_id: string; course_id: string; courses?: { name_en: string } | { name_en: string }[] | null };
type ProductImageRow = { product_id: string; storage_path: string; is_primary: boolean | null; sort_order: number | null };

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `product-${Date.now()}`;
}

export function AdminProducts() {
  const params = useSearchParams();
  const initialQ = params.get("q") || "";
  const [q, setQ] = useState(initialQ);
  const [products, setProducts] = useState<EditableProduct[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [editing, setEditing] = useState<EditableProduct | null>(null);
  const [showPending, setShowPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
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

    const [productResult, courseResult, linkResult, imageResult] = await Promise.all([
      supabase
        .from("products")
        .select("id,source_row_no,source_name,slug,source_togary_price_raw,selling_price_egp,status,is_available,suppress_default_image")
        .order("source_row_no", { ascending: true }),
      supabase.from("courses").select("id,name_en,slug").order("name_en"),
      supabase.from("product_courses").select("product_id,course_id,courses(name_en)"),
      supabase.from("product_images").select("product_id,storage_path,is_primary,sort_order"),
    ]);

    if (productResult.error) {
      setMessage(`${productResult.error.message} — Run migration 006_product_image_editor.sql if needed.`);
      setProducts([]);
    } else {
      const courseMap = new Map<string, { id: string; name: string }>();
      for (const row of (linkResult.data || []) as unknown as ProductCourseRow[]) {
        const rel = Array.isArray(row.courses) ? row.courses[0] : row.courses;
        if (rel?.name_en && !courseMap.has(row.product_id)) {
          courseMap.set(row.product_id, { id: row.course_id, name: rel.name_en });
        }
      }

      const imageMap = new Map<string, ProductImageRow>();
      const imageRows = ((imageResult.data || []) as ProductImageRow[]).sort((a, b) => {
        if (Boolean(a.is_primary) !== Boolean(b.is_primary)) return a.is_primary ? -1 : 1;
        return Number(a.sort_order || 0) - Number(b.sort_order || 0);
      });
      for (const row of imageRows) if (!imageMap.has(row.product_id)) imageMap.set(row.product_id, row);

      setProducts(((productResult.data || []) as DbProduct[]).map((row, index) => {
        const c = courseMap.get(row.id);
        const sourceRow = row.source_row_no ?? (10000 + index);
        const customImage = imageMap.get(row.id);
        const customUrl = customImage
          ? supabase.storage.from("dento-media").getPublicUrl(customImage.storage_path).data.publicUrl
          : undefined;
        const fallback = !row.suppress_default_image && row.source_row_no
          ? productImageById[row.source_row_no]
          : undefined;

        return {
          dbId: row.id,
          id: sourceRow,
          sourceName: row.source_name || `Product ${sourceRow}`,
          slug: row.slug,
          sourceTogary: row.source_togary_price_raw,
          sellingPrice: row.selling_price_egp === null ? null : Number(row.selling_price_egp),
          status: row.status,
          image: customUrl || fallback,
          customImagePath: customImage?.storage_path,
          suppressDefaultImage: Boolean(row.suppress_default_image),
          course: c?.name || "Unassigned",
          courseId: c?.id || null,
          available: row.is_available,
        };
      }));
    }

    if (courseResult.error) setMessage((current) => current || courseResult.error.message);
    if (imageResult.error) setMessage((current) => current || imageResult.error.message);
    setCourses((courseResult.data || []) as Course[]);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  const pending = products.filter((p) => p.sellingPrice === null && p.status !== "archived").length;
  const priced = products.filter((p) => p.sellingPrice !== null && p.status === "active" && p.available).length;
  const visible = useMemo(
    () => products.filter((p) => (!showPending || p.sellingPrice === null) && p.sourceName.toLowerCase().includes(q.toLowerCase())),
    [products, q, showPending]
  );

  function newProduct() {
    const next = Math.max(119, ...products.filter((p) => p.id < 10000).map((p) => p.id)) + 1;
    setEditing({
      dbId: "", id: next, sourceName: "", slug: "", sourceTogary: null,
      sellingPrice: null, status: "draft", image: undefined, customImagePath: undefined,
      suppressDefaultImage: false, course: "Unassigned", courseId: null, available: true,
    });
  }

  async function save() {
    if (!editing || !editing.sourceName.trim()) return;
    const supabase = createClient();
    if (!supabase) return;

    setSaving(true);
    setMessage("");
    const price = editing.sellingPrice === null ? null : Number(editing.sellingPrice);
    const status: EditableProduct["status"] = editing.status === "archived" ? "archived" : price === null ? "draft" : "active";
    let dbId = editing.dbId;

    if (dbId) {
      const { error } = await supabase.from("products").update({
        source_name: editing.sourceName.trim(),
        slug: editing.slug || slugify(editing.sourceName),
        selling_price_egp: price,
        status,
        is_available: editing.available,
        suppress_default_image: editing.suppressDefaultImage,
        updated_at: new Date().toISOString(),
      }).eq("id", dbId);
      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { data, error } = await supabase.from("products").insert({
        source_row_no: editing.id,
        source_name: editing.sourceName.trim(),
        slug: slugify(editing.sourceName),
        selling_price_egp: price,
        status,
        is_available: editing.available,
        suppress_default_image: editing.suppressDefaultImage,
      }).select("id").single();
      if (error || !data) {
        setMessage(error?.message || "Could not create product.");
        setSaving(false);
        return;
      }
      dbId = String(data.id);
    }

    await supabase.from("product_courses").delete().eq("product_id", dbId);
    if (editing.courseId) await supabase.from("product_courses").insert({ product_id: dbId, course_id: editing.courseId });

    setEditing(null);
    await load();
    window.dispatchEvent(new Event("dento-catalog-updated"));
    setSaving(false);
  }

  async function uploadProductImage(file: File) {
    if (!editing?.dbId) {
      setMessage("Save the new product first, then reopen it to upload its image.");
      return;
    }
    const supabase = createClient();
    if (!supabase) return;

    setImageBusy(true);
    setMessage("");
    let newPath = "";

    try {
      const uploaded = await uploadAdminImage(supabase, file, "products");
      newPath = uploaded.path;

      const { data: newRow, error: insertError } = await supabase.from("product_images").insert({
        product_id: editing.dbId,
        storage_path: uploaded.path,
        alt_en: titleCaseSource(editing.sourceName),
        is_primary: true,
        sort_order: 0,
      }).select("id").single();
      if (insertError || !newRow) throw insertError || new Error("Could not save product image.");

      const { data: oldRows } = await supabase
        .from("product_images")
        .select("id,storage_path")
        .eq("product_id", editing.dbId)
        .neq("id", String(newRow.id));

      const { error: deleteRowsError } = await supabase
        .from("product_images")
        .delete()
        .eq("product_id", editing.dbId)
        .neq("id", String(newRow.id));
      if (deleteRowsError) throw deleteRowsError;

      const { error: productError } = await supabase
        .from("products")
        .update({ suppress_default_image: false, updated_at: new Date().toISOString() })
        .eq("id", editing.dbId);
      if (productError) throw productError;

      const paths = (oldRows || []).map((row) => String(row.storage_path)).filter(Boolean);
      if (paths.length) await supabase.storage.from("dento-media").remove(paths);

      setEditing({ ...editing, image: uploaded.publicUrl, customImagePath: uploaded.path, suppressDefaultImage: false });
      window.dispatchEvent(new Event("dento-catalog-updated"));
    } catch (error) {
      if (newPath) await supabase.storage.from("dento-media").remove([newPath]);
      setMessage(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setImageBusy(false);
    }
  }

  function onProductImageFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void uploadProductImage(file);
  }

  async function removeProductImage() {
    if (!editing?.dbId) return;
    if (!window.confirm("Remove this product image? The product will show no image until you upload another one.")) return;
    const supabase = createClient();
    if (!supabase) return;

    setImageBusy(true);
    setMessage("");

    try {
      const { data: rows, error: readError } = await supabase
        .from("product_images")
        .select("storage_path")
        .eq("product_id", editing.dbId);
      if (readError) throw readError;

      const { error: rowError } = await supabase.from("product_images").delete().eq("product_id", editing.dbId);
      if (rowError) throw rowError;

      const { error: productError } = await supabase
        .from("products")
        .update({ suppress_default_image: true, updated_at: new Date().toISOString() })
        .eq("id", editing.dbId);
      if (productError) throw productError;

      const paths = (rows || []).map((row) => String(row.storage_path)).filter(Boolean);
      if (paths.length) await supabase.storage.from("dento-media").remove(paths);

      setEditing({ ...editing, image: undefined, customImagePath: undefined, suppressDefaultImage: true });
      window.dispatchEvent(new Event("dento-catalog-updated"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not remove product image.");
    } finally {
      setImageBusy(false);
    }
  }

  async function archiveProduct() {
    if (!editing?.dbId || !confirm("Archive this product? It will disappear from the storefront but remain in your database/history.")) return;
    const supabase = createClient();
    if (!supabase) return;
    const { error } = await supabase.from("products").update({
      status: "archived", is_available: false, updated_at: new Date().toISOString(),
    }).eq("id", editing.dbId);
    if (error) setMessage(error.message);
    else {
      setEditing(null);
      await load();
      window.dispatchEvent(new Event("dento-catalog-updated"));
    }
  }

  return <>
    <div className="admin-pagehead">
      <div>
        <span className="admin-kicker">CATALOG</span>
        <h1>Products</h1>
        <p>Live Supabase catalog: edit public prices, availability, course placement and product images.</p>
      </div>
      <div className="page-actions">
        <button className="admin-secondary"><Upload size={16}/> Import</button>
        <button className="admin-primary" onClick={newProduct}><Plus size={16}/> Add product</button>
      </div>
    </div>

    {message && <div className="admin-alert"><AlertTriangle size={18}/><div><b>Catalog message</b><span>{message}</span></div></div>}

    <div className="admin-alert">
      <AlertTriangle size={18}/>
      <div><b>{pending} products still need a price</b><span>They stay private to Admin and never appear publicly until a selling price is entered.</span></div>
      <button onClick={() => setShowPending(true)}>Review pricing</button>
    </div>

    <div className="admin-table-card">
      <div className="table-tools">
        <div className="admin-search boxed"><Search size={16}/><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search catalog..."/></div>
        <button className={`admin-secondary ${showPending ? "active-filter" : ""}`} onClick={() => setShowPending((x) => !x)}>
          <SlidersHorizontal size={16}/> {showPending ? "Pending only" : "All products"}
        </button>
        <span>{priced} public-ready / {products.length} total</span>
      </div>

      <div className="admin-table-scroll">
        {loading ? <div className="admin-loading"><Loader2 className="spin"/> Loading live catalog…</div> :
        <table className="admin-table">
          <thead><tr><th>Product</th><th>Source value</th><th>Selling price</th><th>Course section</th><th>Visibility</th><th/></tr></thead>
          <tbody>{visible.map((p, i) => <tr key={p.dbId}>
            <td><div className="product-cell">
              <div className={`mini-thumb t${i % 5} ${p.image ? "with-image" : ""}`}>
                {p.image ? <img src={p.image} alt=""/> : titleCaseSource(p.sourceName).slice(0, 2)}
              </div>
              <div><b>{titleCaseSource(p.sourceName)}</b><small>{p.customImagePath ? "Custom product image" : p.image ? "Mapped product image" : "No image"}</small></div>
            </div></td>
            <td><span className="private-price">{p.sourceTogary || "—"}</span><small className="table-sub">Source sheet</small></td>
            <td>{p.sellingPrice !== null ? <><b>{p.sellingPrice} EGP</b><small className="table-sub">Public price</small></> : <button className="price-missing" onClick={() => setEditing({ ...p })}>Set price</button>}</td>
            <td><span className="course-assignment">{p.course}</span></td>
            <td><span className={`badge ${p.status === "archived" ? "warning" : p.sellingPrice !== null && p.available ? "success" : "warning"}`}>{p.status === "archived" ? "Archived" : p.sellingPrice !== null && p.available ? "Public" : "Admin only"}</span></td>
            <td><button className="dots" onClick={() => setEditing({ ...p })} title="Edit product"><Pencil size={15}/></button></td>
          </tr>)}</tbody>
        </table>}
      </div>
    </div>

    {editing && <div className="admin-modal-backdrop">
      <div className="admin-modal product-editor dento-product-editor-v2">
        <div className="admin-modal-head">
          <div><span className="admin-kicker">PRODUCT EDITOR</span><h2>{editing.dbId ? titleCaseSource(editing.sourceName) : "Add product"}</h2></div>
          <button onClick={() => setEditing(null)}><X/></button>
        </div>

        <div className="product-edit-grid">
          <div className="product-editor-preview dento-product-image-editor">
            <div className="dento-product-image-canvas">
              {editing.image ? <img src={editing.image} alt={titleCaseSource(editing.sourceName)}/> : <div><ImageIcon/><span>No product image</span></div>}
            </div>

            <div className="dento-product-image-actions">
              <label className={`admin-secondary dento-file-button ${imageBusy || !editing.dbId ? "disabled" : ""}`}>
                {imageBusy ? <Loader2 className="spin" size={15}/> : <UploadCloud size={15}/>}
                {editing.image ? "Replace image" : "Upload image"}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden disabled={imageBusy || !editing.dbId} onChange={onProductImageFile}/>
              </label>
              {editing.image && editing.dbId && <button className="admin-secondary danger-button" disabled={imageBusy} onClick={() => void removeProductImage()}><Trash2 size={15}/> Remove image</button>}
            </div>

            {!editing.dbId && <small>Save this new product first, then reopen it to upload an image.</small>}
            {editing.dbId && <small>JPG, PNG, WEBP or GIF • max 8 MB</small>}
            <small>Catalog row: {editing.id}</small>
          </div>

          <div className="product-editor-fields">
            <label>Product name<input value={editing.sourceName} onChange={(e) => setEditing({ ...editing, sourceName: e.target.value })}/></label>
            <label>Public selling price (EGP)<input type="number" min="0" step="0.01" value={editing.sellingPrice ?? ""} onChange={(e) => setEditing({ ...editing, sellingPrice: e.target.value === "" ? null : Number(e.target.value) })} placeholder="Enter price"/></label>
            <label>Course section<select value={editing.courseId || ""} onChange={(e) => { const c = courses.find((x) => x.id === e.target.value); setEditing({ ...editing, courseId: c?.id || null, course: c?.name_en || "Unassigned" }); }}><option value="">Unassigned</option>{courses.map((c) => <option value={c.id} key={c.id}>{c.name_en}</option>)}</select></label>
            <label className="ad-switch"><input type="checkbox" checked={editing.available} onChange={(e) => setEditing({ ...editing, available: e.target.checked })}/><span>Available for sale</span></label>
            {editing.sourceTogary && <div className="source-value-box"><span>Internal source value</span><b>{editing.sourceTogary}</b><small>This value stays Admin-only.</small></div>}
          </div>
        </div>

        <div className="admin-modal-footer">
          {editing.dbId && <button className="admin-secondary danger-button" onClick={() => void archiveProduct()}><Archive size={15}/> Archive</button>}
          <span className="modal-spacer"/>
          <button className="admin-secondary" onClick={() => setEditing(null)}>Cancel</button>
          <button className="admin-primary" disabled={saving || imageBusy} onClick={() => void save()}>{saving ? <Loader2 className="spin" size={15}/> : <Save size={15}/>} Save changes</button>
        </div>
      </div>
    </div>}
  </>;
}
