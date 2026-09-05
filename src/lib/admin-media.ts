import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (fromName && fromName.length <= 5) return fromName;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

export async function uploadAdminImage(
  supabase: SupabaseClient,
  file: File,
  folder: "ads" | "bundles"
) {
  if (!ALLOWED.has(file.type)) {
    throw new Error("Use a JPG, PNG, WEBP or GIF image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 8 MB or smaller.");
  }

  const path = `${folder}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extensionFor(file)}`;

  const { error } = await supabase.storage
    .from("dento-media")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) throw error;

  const { data } = supabase.storage.from("dento-media").getPublicUrl(path);
  if (!data.publicUrl) throw new Error("Image uploaded, but its public URL could not be created.");

  return { publicUrl: data.publicUrl, path };
}
