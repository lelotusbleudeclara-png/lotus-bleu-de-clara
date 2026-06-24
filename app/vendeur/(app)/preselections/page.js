import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const STATUS_LABELS = {
  nouvelle: { label: "Nouvelle", className: "bg-blue-100 text-blue-700" },
  en_attente_parent: { label: "Attente parent", className: "bg-amber-100 text-amber-700" },
  confirmee: { label: "Confirmée", className: "bg-lotus-100 text-lotus-700" },
  annulee: { label: "Annulée", className: "bg-stone-100 text-stone-500" },
};

export default async function PreselectionsPage() {
  const { data: preselections, error } = await supabaseAdmin
    .from("preselections")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-red-600">Erreur de chargement : {error.message}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-lotus-800" style={{ fontFamily: "var(--font-heading)" }}>
        Présélections
      </h1>

      <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100">
        {(!preselections || preselections.length === 0) && (
          <p className="text-stone-500 text-sm p-4">Aucune présélection reçue pour le moment.</p>
        )}
        {preselections?.map((p) => {
          const status = STATUS_LABELS[p.status] || STATUS_LABELS.nouvelle;
          return (
            <Link
              key={p.id}
              href={`/vendeur/preselections/${p.id}`}
              className="flex items-center gap-3 p-3 hover:bg-lotus-50 transition"
            >
              <div className="flex-1">
                <p className="font-medium text-stone-800">
                  {p.buyer_name} {p.is_minor && <span className="text-xs text-stone-400">(mineur·e)</span>}
                </p>
                <p className="text-xs text-stone-400">
                  {new Date(p.created_at).toLocaleString("fr-FR")} · {p.items?.length || 0} article(s)
                </p>
              </div>
              <span className="text-sm text-stone-600 whitespace-nowrap">
                {Number(p.total).toFixed(2)} €
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${status.className}`}>
                {status.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
