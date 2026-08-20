"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BUCKET = "product-photos";

export async function uploadPhoto(productId, formData) {
  const file = formData.get("photo");
  if (!file || typeof file === "string" || file.size === 0) throw new Error("Aucun fichier sélectionné.");
  const ext = (file.name?.split(".").pop() || "jpg").toLowerCase();
  const path = `${productId}/${crypto.randomUUID()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabaseAdmin.storage.from(BUCKET).upload(path, arrayBuffer, { contentType: file.type || "image/jpeg", upsert: false });
  if (uploadError) throw new Error(uploadError.message);
  const { data: existing } = await supabaseAdmin.from("product_photos").select("position").eq("product_id", productId).order("position", { ascending: false }).limit(1);
  const nextPosition = existing?.length > 0 ? existing[0].position + 1 : 0;
  const { error } = await supabaseAdmin.from("product_photos").insert({ product_id: productId, storage_path: path, position: nextPosition, approved: false });
  if (error) throw new Error(error.message);
  revalidatePath(`/vendeur/produits/${productId}`);
}

export async function addVideoUrl(productId, formData) {
  const url = formData.get("video_url")?.toString().trim();
  if (!url) throw new Error("URL manquante.");
  const { data: existing } = await supabaseAdmin.from("product_photos").select("position").eq("product_id", productId).order("position", { ascending: false }).limit(1);
  const nextPosition = existing?.length > 0 ? existing[0].position + 1 : 0;
  const { error } = await supabaseAdmin.from("product_photos").insert({ product_id: productId, storage_path: "", video_url: url, position: nextPosition, approved: false });
  if (error) throw new Error(error.message);
  revalidatePath(`/vendeur/produits/${productId}`);
}

export async function approvePhoto(productId, photoId) {
  const { error } = await supabaseAdmin.from("product_photos").update({ approved: true }).eq("id", photoId);
  if (error) throw new Error(error.message);
  revalidatePath(`/vendeur/produits/${productId}`);
}

export async function unapprovePhoto(productId, photoId) {
  const { error } = await supabaseAdmin.from("product_photos").update({ approved: false }).eq("id", photoId);
  if (error) throw new Error(error.message);
  revalidatePath(`/vendeur/produits/${productId}`);
}

export async function deletePhoto(productId, photoId, storagePath) {
  if (storagePath) await supabaseAdmin.storage.from(BUCKET).remove([storagePath]);
  const { error } = await supabaseAdmin.from("product_photos").delete().eq("id", photoId);
  if (error) throw new Error(error.message);
  revalidatePath(`/vendeur/produits/${productId}`);
}

export async function setMainPhoto(productId, photoId) {
  // Unset all, then set the chosen one
  await supabaseAdmin.from("product_photos").update({ is_main: false }).eq("product_id", productId);
  const { error } = await supabaseAdmin.from("product_photos").update({ is_main: true }).eq("id", photoId);
  if (error) throw new Error(error.message);
  revalidatePath(`/vendeur/produits/${productId}`);
}
