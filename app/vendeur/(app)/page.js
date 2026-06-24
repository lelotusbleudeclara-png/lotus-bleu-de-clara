import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function startOfMonthISO() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export default async function DashboardPage() {
  const [{ data: transactions }, { data: preselections }, { data: products }] = await Promise.all([
    supabaseAdmin.from("transactions").select("*"),
    supabaseAdmin.from("preselections").select("id, status"),
    supabaseAdmin.from("products").select("id, name, in_stock, published"),
  ]);

  const allTransactions = transactions || [];
  const totalRevenue = allTransactions.reduce((sum, t) => sum + Number(t.total || 0), 0);
  const salesCount = allTransactions.length;

  const monthStart = startOfMonthISO();
  const monthTransactions = allTransactions.filter((t) => t.transacted_at >= monthStart);
  const monthRevenue = monthTransactions.reduce((sum, t) => sum + Number(t.total || 0), 0);

  const pendingPreselections = (preselections || []).filter(
    (p) => p.status === "nouvelle" || p.status === "en_attente_parent"
  );

  const outOfStock = (products || []).filter((p) => !p.in_stock);
  const unpublished = (products || []).filter((p) => !p.published);

  const productStats = new Map();
  for (const t of allTransactions) {
    for (const item of t.items || []) {
      const key = item.product_id || item.name;
      const existing = productStats.get(key) || { name: item.name, count: 0, revenue: 0 };
      existing.count += 1;
      existing.revenue += Number(item.price || 0);
      productStats.set(key, existing);
    }
  }
  const topProducts = Array.from(productStats.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl text-lotus-800" style={{ fontFamily: "var(--font-heading)" }}>
        Tableau de bord
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Chiffre d'affaires total" value={`${totalRevenue.toFixed(2)} €`} />
        <StatCard label="Ce mois-ci" value={`${monthRevenue.toFixed(2)} €`} />
        <StatCard label="Ventes réalisées" value={salesCount} />
        <StatCard label="Présélections en attente" value={pendingPreselections.length} highlight={pendingPreselections.length > 0} />
      </div>

      {outOfStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-800 mb-1">
            {outOfStock.length} produit(s) épuisé(s)
          </p>
          <ul className="text-sm text-amber-700 space-y-0.5">
            {outOfStock.slice(0, 5).map((p) => (
              <li key={p.id}>
                <Link href={`/vendeur/produits/${p.id}`} className="hover:underline">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {unpublished.length > 0 && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
          <p className="text-sm font-medium text-stone-600">
            {unpublished.length} produit(s) en brouillon, non visibles sur le catalogue public.
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <h2 className="text-sm font-medium text-stone-700 mb-3">Top produits (par chiffre d&apos;affaires)</h2>
        {topProducts.length === 0 ? (
          <p className="text-sm text-stone-500">Pas encore de vente enregistrée.</p>
        ) : (
          <ul className="divide-y divide-stone-100 text-sm">
            {topProducts.map((p, i) => (
              <li key={i} className="py-2 flex justify-between">
                <span>{p.name}</span>
                <span className="text-stone-600">
                  {p.revenue.toFixed(2)} € · {p.count} vente(s)
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-3">
        <Link
          href="/vendeur/preselections"
          className="text-sm text-lotus-700 hover:text-lotus-900 underline"
        >
          Voir les présélections →
        </Link>
        <Link
          href="/vendeur/transactions"
          className="text-sm text-lotus-700 hover:text-lotus-900 underline"
        >
          Voir l&apos;historique des ventes →
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight ? "bg-amber-50 border-amber-200" : "bg-white border-stone-200"
      }`}
    >
      <p className="text-xs text-stone-400">{label}</p>
      <p className="text-xl font-semibold text-stone-800 mt-1">{value}</p>
    </div>
  );
}
