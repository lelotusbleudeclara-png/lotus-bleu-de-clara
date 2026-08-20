"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function createSubcategory(categoryId, formData) {
  const name = formData.get("name")?.toString().trim();
  if (!name) return;
  const { error } = await supabaseAdmin.from("subcategories").insert({ category_id: categoryId, name });
  if (error) throw new Error(error.message);
  revalidatePath("/vendeur/categories");
  revalidatePath("/vendeur/produits/nouveau");
  revalidatePath("/vendeur/produits", "layout");
}

export async function deleteSubcategory(id) {
  const { error } = await supabaseAdmin.from("subcategories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/vendeur/categories");
  revalidatePath("/vendeur/produits/nouveau");
  revalidatePath("/vendeur/produits", "layout");
}
