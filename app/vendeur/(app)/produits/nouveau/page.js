import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createProduct } from "@/lib/actions/products";

export default async function NouveauProduitPage() {
  const { data: categories } = await supabaseAdmin.from("categories").select("id, name").order("name");

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl text-lotus-800" style={{ fontFamily: "var(--font-heading)" }}>
        Nouveau produit
      </h1>

      <form action={createProduct} className="space-y-5 bg-white rounded-2xl border border-stone-200 p-5">

        {/* 1. Catégorie */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Catégorie <span className="text-red-500">*</span></label>
          <select name="category_id" required className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500">
            <option value="">— Choisir une catégorie —</option>
            {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* 2. Prix */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Prix (€) <span className="text-red-500">*</span></label>
          <input type="text" name="price" required placeholder="12.50"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
        </div>

        {/* 4. Description */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Description du produit <span className="text-red-500">*</span></label>
          <textarea name="description" required rows={3}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
        </div>

        {/* 5. Nom */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Nom du produit <span className="text-red-500">*</span></label>
          <input type="text" name="name" required
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
        </div>

        <hr className="border-stone-100" />
        <p className="text-xs text-stone-400 uppercase tracking-wide">Champs facultatifs</p>

        {/* Stock */}
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" name="in_stock" defaultChecked className="rounded" />
          En stock
        </label>

        {/* Conditions d'utilisation */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Conditions d'utilisation</label>
          <textarea name="conditions_utilisation" rows={2} placeholder="Ex. Ne pas mouiller, déconseillé aux moins de 3 ans..."
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
        </div>

        {/* Labels */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-stone-700 mb-1">Mettre en avant</label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" name="label_selection" className="rounded" />
            ✨ La sélection du moment
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" name="label_collection" className="rounded" />
            🌸 Collection saisonnière
          </label>
        </div>

        {/* Publié */}
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" name="published" className="rounded" />
          Publié (visible sur le catalogue public)
        </label>

        <p className="text-xs text-stone-400">Les photos et vidéos s'ajoutent après la création du produit.</p>

        <button type="submit"
          className="w-full rounded-full bg-lotus-600 text-white text-sm font-medium px-5 py-2 hover:bg-lotus-700 transition">
          Créer le produit
        </button>
      </form>
    </div>
  );
}
