"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function parseProductFields(formData) {
  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const priceRaw = formData.get("price")?.toString().replace(",", ".");
  const price = priceRaw ? Number.parseFloat(priceRaw) : null;
  const categoryId = formData.get("category_id")?.toString() || null;
  const inStock = formData.get("in_stock") === "on";
  const published = formData.get("published") === "on";
  const conditionsUtilisation = formData.get("conditions_utilisation")?.toString().trim() || null;
  const labels = [];
  if (formData.get("label_selection") === "on") labels.push("selection_moment");
  if (formData.get("label_collection") === "on") labels.push("collection_saisonniere");
  return { name, description, price, categoryId, inStock, published, conditionsUtilisation, labels };
}

export async function createProduct(formData) {
  const { name, description, price, categoryId, inStock, published, conditionsUtilisation, labels } = parseProductFields(formData);
  if (!name || price === null || Number.isNaN(price)) throw new Error("Nom et prix sont obligatoires.");
  const { data, error } = await supabaseAdmin.from("products").insert({
    name, description, price,
    category_id: categoryId,
    in_stock: inStock,
    published,
    conditions_utilisation: conditionsUtilisation,
    labels,
  }).select("id").single();
  if (error) throw new Error(error.message);
  revalidatePath("/vendeur/produits");
  redirect(`/vendeur/produits/${data.id}`);
}

export async function updateProduct(id, formData) {
  const { name, description, price, categoryId, inStock, published, conditionsUtilisation, labels } = parseProductFields(formData);
  if (!name || price === null || Number.isNaN(price)) throw new Error("Nom et prix sont obligatoires.");
  const { error } = await supabaseAdmin.from("products").update({
    name, description, price,
    category_id: categoryId,
    in_stock: inStock,
    published,
    conditions_utilisation: conditionsUtilisation,
    labels,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/vendeur/produits");
  revalidatePath(`/vendeur/produits/${id}`);
}

export async function deleteProduct(id) {
  const { data: photos } = await supabaseAdmin.from("product_photos").select("storage_path").eq("product_id", id);
  if (photos?.length) await supabaseAdmin.storage.from("product-photos").remove(photos.filter(p => p.storage_path).map(p => p.storage_path));
  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/vendeur/produits");
  redirect("/vendeur/produits");
}
