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

  return { name, description, price, categoryId, inStock, published };
}

export async function createProduct(formData) {
  const { name, description, price, categoryId, inStock, published } =
    parseProductFields(formData);

  if (!name || price === null || Number.isNaN(price)) {
    throw new Error("Nom et prix sont obligatoires.");
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({
      name,
      description,
      price,
      category_id: categoryId,
      in_stock: inStock,
      published,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/vendeur/produits");
  redirect(`/vendeur/produits/${data.id}`);
}

export async function updateProduct(id, formData) {
  const { name, description, price, categoryId, inStock, published } =
    parseProductFields(formData);

  if (!name || price === null || Number.isNaN(price)) {
    throw new Error("Nom et prix sont obligatoires.");
  }

  const { error } = await supabaseAdmin
    .from("products")
    .update({
      name,
      description,
      price,
      category_id: categoryId,
      in_stock: inStock,
      published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/vendeur/produits");
  revalidatePath(`/vendeur/produits/${id}`);
}

export async function deleteProduct(id) {
  // Nettoyage des photos dans le Storage avant suppression (cascade en base).
  const { data: photos } = await supabaseAdmin
    .from("product_photos")
    .select("storage_path")
    .eq("product_id", id);

  if (photos && photos.length > 0) {
    await supabaseAdmin.storage
      .from("product-photos")
      .remove(photos.map((p) => p.storage_path));
  }

  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/vendeur/produits");
  redirect("/vendeur/produits");
}
