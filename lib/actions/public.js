"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function createPreselection(formData) {
  const buyerName  = formData.get("buyer_name")?.toString().trim()  || "";
  const buyerEmail = formData.get("buyer_email")?.toString().trim() || "";
  const buyerPhone = formData.get("buyer_phone")?.toString().trim() || null;
  const isMinor    = formData.get("is_minor") === "on";
  const parentEmail = isMinor ? formData.get("parent_email")?.toString().trim() || null : null;
  const parentPhone = isMinor ? formData.get("parent_phone")?.toString().trim() || null : null;
  const itemsRaw   = formData.get("items_json")?.toString() || "[]";

  if (!buyerName || !buyerEmail) throw new Error("Nom et email requis.");

  let items;
  try { items = JSON.parse(itemsRaw); } catch { items = []; }
  if (!items.length) throw new Error("Sélectionne au moins un bijou.");

  const total = items.reduce((s, i) => s + Number(i.price), 0).toFixed(2);

  const { data: presel, error } = await supabaseAdmin
    .from("preselections")
    .insert({
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_phone: buyerPhone,
      is_minor: isMinor,
      parent_email: parentEmail,
      parent_phone: parentPhone,
      items,
      total: Number(total),
      status: isMinor ? "en_attente_parent" : "nouvelle",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Best-effort email notification
  const webhookUrl = process.env.NEXT_PUBLIC_EMAIL_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "new_preselection", buyer_name: buyerName, buyer_email: buyerEmail, buyer_phone: buyerPhone, is_minor: isMinor, parent_email: parentEmail, parent_phone: parentPhone, items, total }),
      });
    } catch {}
  }

  return { ok: true, id: presel.id, isMinor };
}
