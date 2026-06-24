import { supabase } from "@/lib/supabaseClient";
import ProductCard from "@/components/ProductCard";

export const revalidate = 0;

async function getCatalog() {
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("id, name, description, price, in_stock, category_id, product_photos(storage_path, position)")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (catError || prodError) {
    console.error(catError || prodError);
    return { categories: [], products: [] };
  }

  return { categories: categories || [], products: products || [] };
}

export default async function CatalogPage() {
  const { categories, products } = await getCatalog();

  const uncategorized = products.filter((p) => !p.category_id);
  const hasAny = products.length > 0;

  return (
    <div className="flex flex-col gap-10">
      <section className="text-center py-6">
        <h1 className="text-2xl font-semibold text-stone-800">Bijoux faits main par Clara</h1>
        <p className="text-stone-500 mt-2 max-w-xl mx-auto">
          Chaque création est unique. Sélectionnez vos bijoux préférés, ils seront réservés
          dans votre panier — la remise se fait toujours en main propre, en liquide.
        </p>
      </section>

      {!hasAny && (
        <p className="text-center text-stone-400 italic">
          Le catalogue est en cours de préparation, revenez bientôt !
        </p>
      )}

      {categories.map((cat) => {
        const catProducts = products.filter((p) => p.category_id === cat.id);
        if (catProducts.length === 0) return null;
        return (
          <section key={cat.id}>
            <h2 className="text-lg font-medium text-stone-700 mb-3">{cat.name}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {catProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        );
      })}

      {uncategorized.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-stone-700 mb-3">Autres créations</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {uncategorized.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
