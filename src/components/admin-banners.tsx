"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadAdminImage } from "@/lib/admin-media";

type Placement = "home_top" | "course_section" | "shop_top";
type CourseRow = { id: string; slug: string; name_en: string };

type Banner = {
  id: string;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  ctaEn: string;
  ctaAr: string;
  href: string;
  placement: Placement;
  courseId: string | null;
  image: string;
  active: boolean;
  sortOrder: number;
};

type DbBanner = {
  id: string;
  title_en: string | null;
  title_ar: string | null;
  subtitle_en: string | null;
  subtitle_ar: string | null;
  cta_en: string | null;
  cta_ar: string | null;
  destination_path: string | null;
  placement: string | null;
  course_id: string | null;
  image_storage_path: string | null;
  is_active: boolean | null;
  sort_order: number | null;
};

const placementLabels: Record<Placement, string> = {
  home_top: "Homepage — top",
  course_section: "Homepage — course section",
  shop_top: "Shop — top",
};

const blank: Banner = {
  id: "",
  titleEn: "",
  titleAr: "",
  subtitleEn: "",
  subtitleAr: "",
  ctaEn: "Shop now",
  ctaAr: "تسوق الآن",
  href: "/shop",
  placement: "home_top",
  courseId: null,
  image: "",
  active: true,
  sortOrder: 0,
};

function normalizePlacement(value: string | null): Placement {
  if (value === "course_section" || value === "shop_top") return value;
  return "home_top";
}

export function AdminBanners() {
  const [ads, setAds] = useState<Banner[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [editing, setEditing] = useState<Banner | null>(null);
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

    const [courseResult, bannerResult] = await Promise.all([
      supabase.from("courses").select("id,slug,name_en").eq("is_active", true).order("name_en"),
      supabase
        .from("homepage_banners")
        .select("id,title_en,title_ar,subtitle_en,subtitle_ar,cta_en,cta_ar,destination_path,placement,course_id,image_storage_path,is_active,sort_order")
        .order("sort_order"),
    ]);

    if (courseResult.error) setMessage(courseResult.error.message);
    setCourses((courseResult.data || []) as CourseRow[]);

    if (bannerResult.error) {
      setMessage(bannerResult.error.message);
      setAds([]);
    } else {
      setAds(
        ((bannerResult.data || []) as DbBanner[]).map((row) => ({
          id: row.id,
          titleEn: row.title_en || "",
          titleAr: row.title_ar || "",
          subtitleEn: row.subtitle_en || "",
          subtitleAr: row.subtitle_ar || "",
          ctaEn: row.cta_en || "Shop now",
          ctaAr: row.cta_ar || "تسوق الآن",
          href: row.destination_path || "/shop",
          placement: normalizePlacement(row.placement),
          courseId: row.course_id,
          image: row.image_storage_path || "",
          active: row.is_active !== false,
          sortOrder: Number(row.sort_order || 0),
        }))
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const activeCount = useMemo(() => ads.filter((ad) => ad.active).length, [ads]);

  async function upload(file: File) {
    const supabase = createClient();
    if (!supabase || !editing) return;

    setUploading(true);
    setMessage("");
    try {
      const { publicUrl } = await uploadAdminImage(supabase, file, "ads");
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

  async function save() {
    if (!editing?.titleEn.trim()) {
      setMessage("English headline is required.");
      return;
    }

    const supabase = createClient();
    if (!supabase) return;

    setSaving(true);
    setMessage("");

    const payload = {
      title_en: editing.titleEn.trim(),
      title_ar: editing.titleAr.trim() || null,
      subtitle_en: editing.subtitleEn.trim() || null,
      subtitle_ar: editing.subtitleAr.trim() || null,
      cta_en: editing.ctaEn.trim() || "Shop now",
      cta_ar: editing.ctaAr.trim() || null,
      destination_path: editing.href.trim() || "/shop",
      placement: editing.placement,
      course_id: editing.courseId || null,
      image_storage_path: editing.image || null,
      is_active: editing.active,
      sort_order: Number(editing.sortOrder || 0),
      updated_at: new Date().toISOString(),
    };

    const result = editing.id
      ? await supabase.from("homepage_banners").update(payload).eq("id", editing.id)
      : await supabase.from("homepage_banners").insert(payload);

    if (result.error) {
      setMessage(result.error.message);
    } else {
      setEditing(null);
      await load();
      window.dispatchEvent(new Event("dento-ads-updated"));
    }

    setSaving(false);
  }

  async function toggle(ad: Banner) {
    const supabase = createClient();
    if (!supabase) return;
    const { error } = await supabase
      .from("homepage_banners")
      .update({ is_active: !ad.active, updated_at: new Date().toISOString() })
      .eq("id", ad.id);

    if (error) setMessage(error.message);
    else {
      await load();
      window.dispatchEvent(new Event("dento-ads-updated"));
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this advertisement?")) return;
    const supabase = createClient();
    if (!supabase) return;
    const { error } = await supabase.from("homepage_banners").delete().eq("id", id);
    if (error) setMessage(error.message);
    else {
      await load();
      window.dispatchEvent(new Event("dento-ads-updated"));
    }
  }

  return (
    <>
      <div className="admin-pagehead">
        <div>
          <span className="admin-kicker">ADVERTISING</span>
          <h1>Ads & banners</h1>
          <p>Upload your own artwork, choose where it appears, and publish or hide it whenever you want.</p>
        </div>
        <button className="admin-primary" onClick={() => setEditing({ ...blank })}>
          <Plus size={16} /> New ad
        </button>
      </div>

      {message && (
        <div className="admin-alert">
          <div>
            <b>Admin message</b>
            <span>{message}</span>
          </div>
        </div>
      )}

      <div className="dento-media-kpis">
        <div><b>{ads.length}</b><span>Total ads</span></div>
        <div><b>{activeCount}</b><span>Live now</span></div>
        <div><b>{ads.filter((ad) => Boolean(ad.image)).length}</b><span>With artwork</span></div>
      </div>

      <div className="admin-table-card">
        <div className="dento-ad-list">
          {loading ? (
            <div className="dento-empty"><Loader2 className="spin" /> Loading ads…</div>
          ) : ads.length === 0 ? (
            <div className="dento-empty">
              <ImageIcon />
              <b>No ads yet</b>
              <span>Create the first banner and upload its image from your phone or computer.</span>
            </div>
          ) : (
            ads.map((ad) => (
              <article className="dento-ad-row" key={ad.id}>
                <div className="dento-ad-thumb">
                  {ad.image ? <img src={ad.image} alt="" /> : <ImageIcon />}
                </div>

                <div className="dento-ad-copy">
                  <div>
                    <b>{ad.titleEn}</b>
                    <span className={`badge ${ad.active ? "success" : "warning"}`}>
                      {ad.active ? "Live" : "Hidden"}
                    </span>
                  </div>
                  <p>{ad.subtitleEn || "No supporting text"}</p>
                  <small>
                    {placementLabels[ad.placement]}
                    {ad.courseId ? ` • ${courses.find((course) => course.id === ad.courseId)?.name_en || "Course"}` : " • All courses"}
                  </small>
                </div>

                <div className="dento-row-actions">
                  <button className="icon-admin-btn" title={ad.active ? "Hide" : "Publish"} onClick={() => void toggle(ad)}>
                    {ad.active ? <EyeOff /> : <Eye />}
                  </button>
                  <button className="icon-admin-btn" title="Edit" onClick={() => setEditing({ ...ad })}>
                    <Pencil />
                  </button>
                  <button className="icon-admin-btn danger" title="Delete" onClick={() => void remove(ad.id)}>
                    <Trash2 />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      {editing && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal dento-media-modal">
            <div className="admin-modal-head">
              <div>
                <span className="admin-kicker">AD EDITOR</span>
                <h2>{editing.id ? "Edit advertisement" : "Create advertisement"}</h2>
              </div>
              <button onClick={() => setEditing(null)}><X /></button>
            </div>

            <div className="dento-editor-grid">
              <div className="dento-form-stack">
                <label>
                  Headline — English
                  <input value={editing.titleEn} onChange={(e) => setEditing({ ...editing, titleEn: e.target.value })} />
                </label>
                <label>
                  Headline — Arabic
                  <input dir="rtl" value={editing.titleAr} onChange={(e) => setEditing({ ...editing, titleAr: e.target.value })} />
                </label>
                <label>
                  Supporting text — English
                  <textarea value={editing.subtitleEn} onChange={(e) => setEditing({ ...editing, subtitleEn: e.target.value })} />
                </label>
                <label>
                  Supporting text — Arabic
                  <textarea dir="rtl" value={editing.subtitleAr} onChange={(e) => setEditing({ ...editing, subtitleAr: e.target.value })} />
                </label>

                <div className="two-field">
                  <label>
                    Button text
                    <input value={editing.ctaEn} onChange={(e) => setEditing({ ...editing, ctaEn: e.target.value })} />
                  </label>
                  <label>
                    Arabic button
                    <input dir="rtl" value={editing.ctaAr} onChange={(e) => setEditing({ ...editing, ctaAr: e.target.value })} />
                  </label>
                </div>

                <label>
                  Destination
                  <input value={editing.href} onChange={(e) => setEditing({ ...editing, href: e.target.value })} placeholder="/shop" />
                </label>

                <div className="two-field">
                  <label>
                    Placement
                    <select value={editing.placement} onChange={(e) => setEditing({ ...editing, placement: e.target.value as Placement })}>
                      {Object.entries(placementLabels).map(([value, label]) => (
                        <option value={value} key={value}>{label}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Course target
                    <select
                      value={editing.courseId || ""}
                      onChange={(e) => setEditing({ ...editing, courseId: e.target.value || null })}
                    >
                      <option value="">All courses</option>
                      {courses.map((course) => (
                        <option value={course.id} key={course.id}>{course.name_en}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="two-field">
                  <label>
                    Sort order
                    <input
                      type="number"
                      value={editing.sortOrder}
                      onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value || 0) })}
                    />
                  </label>
                  <label className="dento-checkbox">
                    <input
                      type="checkbox"
                      checked={editing.active}
                      onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                    />
                    <span>Publish this ad</span>
                  </label>
                </div>
              </div>

              <div className="dento-upload-panel">
                <b>Advertisement image</b>
                <p>Upload JPG, PNG, WEBP or GIF. Maximum 8 MB.</p>

                <div className="dento-upload-preview">
                  {editing.image ? <img src={editing.image} alt="Advertisement preview" /> : <ImageIcon />}
                </div>

                <label className={`dento-upload-button ${uploading ? "disabled" : ""}`}>
                  {uploading ? <Loader2 className="spin" size={17} /> : <UploadCloud size={17} />}
                  {uploading ? "Uploading…" : "Upload image"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    hidden
                    disabled={uploading}
                    onChange={onFile}
                  />
                </label>

                {editing.image && (
                  <button className="admin-secondary" type="button" onClick={() => setEditing({ ...editing, image: "" })}>
                    Remove image
                  </button>
                )}

                <label>
                  Or paste image URL
                  <input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} />
                </label>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button className="admin-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="admin-primary" disabled={saving || uploading} onClick={() => void save()}>
                {saving ? <Loader2 className="spin" size={15} /> : <Save size={15} />}
                Save ad
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
