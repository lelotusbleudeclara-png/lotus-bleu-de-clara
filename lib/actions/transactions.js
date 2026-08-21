"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BUCKET = "transaction-proofs";

export async function createTransaction(formData) {
  const buyerName = formData.get("buyer_name")?.toString().trim();
  const buyerEmail = formData.get("buyer_email")?.toString().trim();
  const isMinor = formData.get("is_minor") === "on";
  const parentEmail = formData.get("parent_email")?.toString().trim() || null;
  const location = formData.get("location")?.toString().trim() || null;
  const preselectionId = formData.get("preselection_id")?.toString() || null;
  const totalRaw = formData.get("total")?.toString().replace(",", ".");
  const total = totalRaw ? Number.parseFloat(totalRaw) : null;

  let items = [];
  try {
    items = JSON.parse(formData.get("items_json")?.toString() || "[]");
  } catch {
    items = [];
  }

  const proofPhoto = formData.get("proof_photo");

  if (!buyerName || !buyerEmail || total === null || Number.isNaN(total) || items.length === 0) {
    throw new Error("Nom, email, total et au moins un article sont obligatoires.");
  }
  if (!proofPhoto || typeof proofPhoto === "string" || proofPhoto.size === 0) {
    throw new Error("La photo de preuve de remise est obligatoire.");
  }

  const arrayBuffer = await proofPhoto.arrayBuffer();
  const ext = (proofPhoto.name?.split(".").pop() || "jpg").toLowerCase();
  const proofPath = `proofs/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(proofPath, arrayBuffer, {
      contentType: proofPhoto.type || "image/jpeg",
      upsert: false,
    });
  if (uploadError) throw new Error(uploadError.message);

  const transactedAt = new Date();

  const { data: transaction, error: insertError } = await supabaseAdmin
    .from("transactions")
    .insert({
      preselection_id: preselectionId || null,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      is_minor: isMinor,
      parent_email: isMinor ? parentEmail : null,
      items,
      total,
      proof_photo_path: proofPath,
      location,
      transacted_at: transactedAt.toISOString(),
    })
    .select("id")
    .single();

  if (insertError) throw new Error(insertError.message);

  if (preselectionId) {
    await supabaseAdmin
      .from("preselections")
      .update({ status: "confirmee" })
      .eq("id", preselectionId);
  }

  // Email de confirmation avec photo de preuve en pièce jointe — best effort,
  // ne doit jamais bloquer l'enregistrement de la transaction côté boutique.
  try {
    const webhookUrl = process.env.NEXT_PUBLIC_EMAIL_WEBHOOK_URL;
    console.log("[LOTUS EMAIL] webhookUrl présent :", !!webhookUrl);
    if (webhookUrl) {
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      console.log("[LOTUS EMAIL] Envoi webhook, taille base64 :", base64.length);
      const emailRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "transaction_completed",
          buyer_name: buyerName,
          buyer_email: buyerEmail,
          is_minor: isMinor,
          parent_email: parentEmail,
          items,
          total,
          transacted_at: transactedAt.toLocaleString("fr-FR", {
            dateStyle: "long",
            timeStyle: "short",
          }),
          location,
          proof_photo_base64: base64,
          proof_photo_mimetype: proofPhoto.type || "image/jpeg",
        }),
      });
      const emailText = await emailRes.text();
      console.log("[LOTUS EMAIL] Réponse GAS :", emailRes.status, emailText.slice(0, 200));
    }
  } catch (e) {
    console.error("[LOTUS EMAIL ERROR]", e?.message || e);
  }

  revalidatePath("/vendeur/transactions");
  revalidatePath("/vendeur/preselections");
  redirect(`/vendeur/transactions/${transaction.id}`);
}

export async function deleteTransaction(id) {
  const { data } = await supabaseAdmin
    .from("transactions")
    .select("proof_photo_path")
    .eq("id", id)
    .single();

  if (data?.proof_photo_path) {
    await supabaseAdmin.storage.from("transaction-proofs").remove([data.proof_photo_path]);
  }

  await supabaseAdmin.from("transactions").delete().eq("id", id);
  revalidatePath("/vendeur/transactions");
  redirect("/vendeur/transactions");
}
