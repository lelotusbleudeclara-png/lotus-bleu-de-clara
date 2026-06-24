import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function ProduitsPage() {
  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("id, name, price, in_stock, published, category_id, categories(name), product_photos(count)")
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-red-600">Erreur de chargement : {error.message}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-lotus-800" style={{ fontFamily: "var(--font-heading)" }}>
          Produits
        </h1>
        <Link
          href="/vendeur/produits/nouveau"
          className="rounded-full bg-lotus-600 text-white text-sm font-medium px-4 py-2 hover:bg-lotus-700 transition"
        >
          Nouveau produit
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100">
        {(!products || products.length === 0) && (
          <p className="text-stone-500 text-sm p-4">Aucun produit pour le moment.</p>
        )}
        {products?.map((p) => (
          <Link
            key={p.id}
            href={`/vendeur/produits/${p.id}`}
            className="flex items-center gap-3 p-3 hover:bg-lotus-50 transition"
          >
            <div className="flex-1">
              <p className="font-medium text-stone-800">{p.name}</p>
              <p className="text-xs text-stone-400">
                {p.categories?.name || "Sans catégorie"} · {p.product_photos?.[0]?.count ?? 0} photo(s)
              </p>
            </div>
            <span className="text-sm text-stone-600 whitespace-nowrap">
              {Number(p.price).toFixed(2)} €
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                p.published ? "bg-lotus-100 text-lotus-700" : "bg-stone-100 text-stone-500"
              }`}
            >
              {p.published ? "Publié" : "Brouillon"}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                p.in_stock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {p.in_stock ? "En stock" : "Épuisé"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
