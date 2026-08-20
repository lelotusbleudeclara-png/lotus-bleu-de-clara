export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createCategory, renameCategory, deleteCategory } from "@/lib/actions/categories";
import { createSubcategory, deleteSubcategory } from "@/lib/actions/subcategories";

export default async function CategoriesPage() {
  const [{ data: categories }, { data: subcategories }] = await Promise.all([
    supabaseAdmin.from("categories").select("id, name").order("name"),
    supabaseAdmin.from("subcategories").select("id, category_id, name").order("name"),
  ]);

  return (
    <div className="space-y-8 max-w-lg">
      <h1 className="text-2xl text-lotus-800" style={{ fontFamily: "var(--font-heading)" }}>Catégories</h1>

      {/* Créer une catégorie */}
      <form action={createCategory} className="flex gap-2">
        <input type="text" name="name" placeholder="Nouvelle catégorie" required
          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
        <button type="submit" className="rounded-full bg-lotus-600 text-white text-sm font-medium px-4 py-2 hover:bg-lotus-700 transition">
          Ajouter
        </button>
      </form>

      {/* Liste des catégories */}
      <div className="space-y-4">
        {(categories || []).map((cat) => {
          const subs = (subcategories || []).filter((s) => s.category_id === cat.id);
          return (
            <div key={cat.id} className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3">
              {/* Catégorie header */}
              <div className="flex items-center gap-2">
                <form action={renameCategory.bind(null, cat.id)} className="flex-1 flex gap-2">
                  <input type="text" name="name" defaultValue={cat.name}
                    className="flex-1 rounded-lg border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
                  <button type="submit" className="text-xs text-lotus-700 hover:text-lotus-900 font-medium">Renommer</button>
                </form>
                <form action={deleteCategory.bind(null, cat.id)}>
                  <button type="submit" className="text-xs text-red-400 hover:text-red-600">Supprimer</button>
                </form>
              </div>

              {/* Sous-catégories */}
              <div className="pl-3 border-l-2 border-stone-100 space-y-2">
                {subs.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-stone-600">↳ {sub.name}</span>
                    <form action={deleteSubcategory.bind(null, sub.id)}>
                      <button type="submit" className="text-xs text-red-400 hover:text-red-600">Supprimer</button>
                    </form>
                  </div>
                ))}
                <form action={createSubcategory.bind(null, cat.id)} className="flex gap-2 pt-1">
                  <input type="text" name="name" placeholder="Nouvelle sous-catégorie"
                    className="flex-1 rounded-lg border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
                  <button type="submit" className="text-xs text-lotus-700 hover:text-lotus-900 font-medium whitespace-nowrap">+ Ajouter</button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
