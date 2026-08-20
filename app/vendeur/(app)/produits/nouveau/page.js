export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createProduct } from "@/lib/actions/products";
import CategorySubcategorySelect from "@/components/CategorySubcategorySelect";
import ConditionsWithLibrary from "@/components/ConditionsWithLibrary";

export default async function NouveauProduitPage() {
  const [{ data: categories }, { data: subcategories }] = await Promise.all([
    supabaseAdmin.from("categories").select("id, name").order("name"),
    supabaseAdmin.from("subcategories").select("id, category_id, name").order("name"),
  ]);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl text-lotus-800" style={{ fontFamily: "var(--font-heading)" }}>Nouveau produit</h1>

      <form action={createProduct} className="space-y-5 bg-white rounded-2xl border border-stone-200 p-5">

        <CategorySubcategorySelect categories={categories || []} subcategories={subcategories || []} />

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Prix (€) <span className="text-red-500">*</span></label>
          <input type="text" name="price" required placeholder="12.50"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Description <span className="text-red-500">*</span></label>
          <textarea name="description" rows={3} required
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Nom du produit <span className="text-red-500">*</span></label>
          <input type="text" name="name" required
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
        </div>

        <hr className="border-stone-100" />
        <p className="text-xs text-stone-400 uppercase tracking-wide">Champs facultatifs</p>

        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" name="in_stock" defaultChecked className="rounded" /> En stock
        </label>

        <ConditionsWithLibrary />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-stone-700 mb-1">Mettre en avant</label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" name="label_selection" className="rounded" /> ✨ La sélection du moment
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" name="label_collection" className="rounded" /> 🌸 Collection saisonnière
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" name="published" className="rounded" /> Publié
        </label>

        <p className="text-xs text-stone-400 italic">Les photos et vidéos s&apos;ajoutent après la création du produit.</p>

        <button type="submit"
          className="w-full rounded-full bg-lotus-600 text-white text-sm font-medium px-5 py-2 hover:bg-lotus-700 transition">
          Créer le produit
        </button>
      </form>
    </div>
  );
}
