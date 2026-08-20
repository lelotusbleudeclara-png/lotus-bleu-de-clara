import { supabaseAdmin } from "@/lib/supabaseAdmin";
import LotusLogo from "@/components/LotusLogo";
import PublicCatalog from "@/components/PublicCatalog";

export default async function HomePage() {
  const { data: allProducts } = await supabaseAdmin
    .from("products")
    .select("*, categories(name), product_photos(id, storage_path, video_url, approved, is_main, position)")
    .eq("published", true)
    .order("name");

  const products = allProducts || [];

  return (
    <div className="min-h-screen bg-ivory">
      <header className="text-center py-12 px-4 space-y-3">
        <div className="flex justify-center">
          <LotusLogo size={64} />
        </div>
        <h1 className="text-4xl sm:text-5xl text-lotus-800" style={{ fontFamily: "var(--font-script)" }}>
          Le Lotus Bleu
        </h1>
        <p className="text-stone-500 text-sm max-w-sm mx-auto">
          Bijoux faits main par Clara · Chaque pièce est unique
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-24 space-y-16">
        {products.length === 0
          ? <p className="text-center text-stone-400 py-24">Le catalogue arrive bientôt…</p>
          : <PublicCatalog products={products} />
        }
      </main>

      <footer className="text-center py-8 text-xs text-stone-400">
        © {new Date().getFullYear()} Le Lotus Bleu de Clara · Fait avec ♡
      </footer>
    </div>
  );
}
