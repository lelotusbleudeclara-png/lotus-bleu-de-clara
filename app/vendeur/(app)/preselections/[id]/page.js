import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { updatePreselectionStatus } from "@/lib/actions/preselections";

const STATUS_OPTIONS = [
  { value: "nouvelle", label: "Nouvelle" },
  { value: "en_attente_parent", label: "En attente d'accord parental" },
  { value: "confirmee", label: "Confirmée" },
  { value: "annulee", label: "Annulée" },
];

export default async function PreselectionDetailPage({ params }) {
  const { id } = await params;

  const { data: preselection, error } = await supabaseAdmin
    .from("preselections")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !preselection) notFound();

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-lotus-800" style={{ fontFamily: "var(--font-heading)" }}>
          {preselection.buyer_name}
        </h1>
        <Link href="/vendeur/preselections" className="text-sm text-stone-500 hover:text-stone-700">
          ← Retour
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-2 text-sm">
        <p><span className="text-stone-400">Email :</span> {preselection.buyer_email}</p>
        {preselection.buyer_phone && (
          <p><span className="text-stone-400">Téléphone :</span> {preselection.buyer_phone}</p>
        )}
        {preselection.is_minor && (
          <>
            <p className="text-amber-600 font-medium">Acheteur·se mineur·e</p>
            {preselection.parent_email && (
              <p><span className="text-stone-400">Email parent :</span> {preselection.parent_email}</p>
            )}
            {preselection.parent_phone && (
              <p><span className="text-stone-400">Téléphone parent :</span> {preselection.parent_phone}</p>
            )}
          </>
        )}
        <p><span className="text-stone-400">Reçue le :</span> {new Date(preselection.created_at).toLocaleString("fr-FR")}</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <h2 className="text-sm font-medium text-stone-700 mb-3">Articles présélectionnés</h2>
        <ul className="divide-y divide-stone-100 text-sm">
          {(preselection.items || []).map((item, i) => (
            <li key={i} className="py-2 flex justify-between">
              <span>{item.name}</span>
              <span className="text-stone-600">{Number(item.price).toFixed(2)} €</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between pt-3 mt-2 border-t border-stone-200 font-medium">
          <span>Total</span>
          <span>{Number(preselection.total).toFixed(2)} €</span>
        </div>
      </div>

      <form action={updatePreselectionStatus.bind(null, id)} className="flex gap-2">
        <select
          name="status"
          defaultValue={preselection.status}
          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-full bg-lotus-600 text-white text-sm font-medium px-4 py-2 hover:bg-lotus-700 transition whitespace-nowrap"
        >
          Mettre à jour
        </button>
      </form>

      {preselection.status !== "annulee" && (
        <Link
          href={`/vendeur/transactions/nouvelle?preselection=${preselection.id}`}
          className="block text-center rounded-full bg-lotus-700 text-white text-sm font-medium px-5 py-2.5 hover:bg-lotus-800 transition"
        >
          Valider la transaction (remise en main propre)
        </Link>
      )}
    </div>
  );
}
