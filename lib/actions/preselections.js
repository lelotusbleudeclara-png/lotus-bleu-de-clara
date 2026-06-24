"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const VALID_STATUSES = ["nouvelle", "en_attente_parent", "confirmee", "annulee"];

export async function updatePreselectionStatus(id, formData) {
  const status = formData.get("status")?.toString();
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Statut invalide.");
  }

  const { error } = await supabaseAdmin
    .from("preselections")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/vendeur/preselections");
  revalidatePath(`/vendeur/preselections/${id}`);
}

export async function cancelPreselection(id) {
  const { error } = await supabaseAdmin
    .from("preselections")
    .update({ status: "annulee" })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/vendeur/preselections");
  revalidatePath(`/vendeur/preselections/${id}`);
}
