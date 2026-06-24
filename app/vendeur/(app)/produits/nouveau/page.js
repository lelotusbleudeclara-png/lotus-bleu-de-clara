import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createProduct } from "@/lib/actions/products";

export default async function NouveauProduitPage() {
  const { data: categories } = await supabaseAdmin
    .from("categories")
    .select("id, name")
    .order("name");

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl text-lotus-800" style={{ fontFamily: "var(--font-heading)" }}>
        Nouveau produit
      </h1>

      <form action={createProduct} className="space-y-4 bg-white rounded-2xl border border-stone-200 p-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Nom</label>
          <input
            type="text"
            name="name"
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
          <textarea
            name="description"
            rows={3}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-stone-700 mb-1">Prix (€)</label>
            <input
              type="text"
              name="price"
              required
              placeholder="12.50"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-stone-700 mb-1">Catégorie</label>
            <select
              name="category_id"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500"
            >
              <option value="">— Sans catégorie —</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" name="in_stock" defaultChecked className="rounded" />
            En stock
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" name="published" className="rounded" />
            Publié (visible sur le catalogue public)
          </label>
        </div>

        <button
          type="submit"
          className="rounded-full bg-lotus-600 text-white text-sm font-medium px-5 py-2 hover:bg-lotus-700 transition"
        >
          Créer le produit
        </button>
      </form>
    </div>
  );
}
