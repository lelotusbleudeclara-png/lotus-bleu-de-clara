import { supabaseAdmin } from "@/lib/supabaseAdmin";
export const dynamic = "force-dynamic";
import { createCategory, renameCategory, deleteCategory } from "@/lib/actions/categories";

export default async function CategoriesPage() {
  const { data: categories, error } = await supabaseAdmin
    .from("categories")
    .select("id, name, created_at, products(count)")
    .order("name");

  if (error) {
    return <p className="text-red-600">Erreur de chargement : {error.message}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-lotus-800" style={{ fontFamily: "var(--font-heading)" }}>
        Catégories
      </h1>

      <form action={createCategory} className="flex gap-2">
        <input
          type="text"
          name="name"
          required
          placeholder="Nouvelle catégorie (ex. Bracelets)"
          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500"
        />
        <button
          type="submit"
          className="rounded-full bg-lotus-600 text-white text-sm font-medium px-4 py-2 hover:bg-lotus-700 transition whitespace-nowrap"
        >
          Ajouter
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100">
        {(!categories || categories.length === 0) && (
          <p className="text-stone-500 text-sm p-4">Aucune catégorie pour le moment.</p>
        )}
        {categories?.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3 p-3">
            <form action={renameCategory.bind(null, cat.id)} className="flex-1 flex gap-2">
              <input
                type="text"
                name="name"
                defaultValue={cat.name}
                className="flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500"
              />
              <button
                type="submit"
                className="text-xs text-lotus-700 hover:text-lotus-900 px-2 whitespace-nowrap"
              >
                Renommer
              </button>
            </form>
            <span className="text-xs text-stone-400 whitespace-nowrap">
              {cat.products?.[0]?.count ?? 0} produit(s)
            </span>
            <form action={deleteCategory.bind(null, cat.id)}>
              <button
                type="submit"
                className="text-xs text-red-500 hover:text-red-700 px-2 whitespace-nowrap"
              >
                Supprimer
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
