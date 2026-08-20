"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function createCategory(formData) {
  const name = formData.get("name")?.toString().trim();
  if (!name) return;

  const { error } = await supabaseAdmin.from("categories").insert({ name });
  if (error) throw new Error(error.message);

  revalidatePath("/vendeur/categories");
  revalidatePath("/vendeur/produits/nouveau");
  revalidatePath("/vendeur/produits", "layout");
}

export async function renameCategory(id, formData) {
  const name = formData.get("name")?.toString().trim();
  if (!name) return;

  const { error } = await supabaseAdmin.from("categories").update({ name }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/vendeur/categories");
  revalidatePath("/vendeur/produits/nouveau");
  revalidatePath("/vendeur/produits", "layout");
}

export async function deleteCategory(id) {
  const { error } = await supabaseAdmin.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/vendeur/categories");
  revalidatePath("/vendeur/produits/nouveau");
  revalidatePath("/vendeur/produits", "layout");
}
