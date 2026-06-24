import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function TransactionsPage() {
  const { data: transactions, error } = await supabaseAdmin
    .from("transactions")
    .select("*")
    .order("transacted_at", { ascending: false });

  if (error) {
    return <p className="text-red-600">Erreur de chargement : {error.message}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-lotus-800" style={{ fontFamily: "var(--font-heading)" }}>
          Historique des transactions
        </h1>
        <Link
          href="/vendeur/transactions/nouvelle"
          className="rounded-full bg-lotus-600 text-white text-sm font-medium px-4 py-2 hover:bg-lotus-700 transition"
        >
          Nouvelle transaction
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100">
        {(!transactions || transactions.length === 0) && (
          <p className="text-stone-500 text-sm p-4">Aucune transaction enregistrée pour le moment.</p>
        )}
        {transactions?.map((t) => (
          <Link
            key={t.id}
            href={`/vendeur/transactions/${t.id}`}
            className="flex items-center gap-3 p-3 hover:bg-lotus-50 transition"
          >
            <div className="flex-1">
              <p className="font-medium text-stone-800">{t.buyer_name}</p>
              <p className="text-xs text-stone-400">
                {new Date(t.transacted_at).toLocaleString("fr-FR")}
                {t.location ? ` · ${t.location}` : ""}
              </p>
            </div>
            <span className="text-sm text-stone-600 whitespace-nowrap">
              {Number(t.total).toFixed(2)} €
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
