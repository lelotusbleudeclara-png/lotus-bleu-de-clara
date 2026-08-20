import { supabaseAdmin } from "@/lib/supabaseAdmin";
import LotusLogo from "@/components/LotusLogo";
import PreselectionForm from "@/components/PreselectionForm";

function getPublicUrl(path) {
  return supabaseAdmin.storage.from("product-photos").getPublicUrl(path).data.publicUrl;
}

function getYoutubeId(url) {
  const m = url?.match(/(?:youtu\.be\/|v=|\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function ProductCard({ product }) {
  const approvedMedia = (product.product_photos || []).filter((p) => p.approved);
  const firstPhoto = approvedMedia.find((p) => p.is_main && !p.video_url) || approvedMedia.find((p) => !p.video_url);
  const firstVideo = approvedMedia.find((p) => p.video_url);
  const thumb = firstPhoto ? getPublicUrl(firstPhoto.storage_path) : null;

  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm hover:shadow-md transition group">
      <div className="aspect-square bg-stone-50 overflow-hidden relative">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        ) : firstVideo ? (
          <iframe
            src={`https://www.youtube.com/embed/${getYoutubeId(firstVideo.video_url)}`}
            className="w-full h-full"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300 text-4xl">✦</div>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs font-medium text-stone-500 bg-white px-3 py-1 rounded-full border border-stone-200">Épuisé</span>
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <p className="text-xs text-stone-400 uppercase tracking-wide">{product.categories?.name || "Bijou"}</p>
        <h3 className="text-base text-stone-800 leading-snug" style={{ fontFamily: "var(--font-heading)" }}>{product.name}</h3>
        {product.description && <p className="text-sm text-stone-500 line-clamp-2">{product.description}</p>}
        {product.conditions_utilisation && (
          <p className="text-xs text-stone-400 italic">{product.conditions_utilisation}</p>
        )}
        <p className="text-lg font-semibold text-lotus-700">{Number(product.price).toFixed(2)} €</p>

        {approvedMedia.length > 1 && (
          <div className="flex gap-1 flex-wrap pt-1">
            {approvedMedia.slice(1, 5).map((m) => (
              m.video_url ? (
                <a key={m.id} href={m.video_url} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded bg-stone-100 flex items-center justify-center text-xs text-stone-400 hover:bg-stone-200 transition">▶</a>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={m.id} src={getPublicUrl(m.storage_path)} alt="" className="w-10 h-10 rounded object-cover border border-stone-100" />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, products }) {
  if (!products?.length) return null;
  return (
    <section className="space-y-6">
      <h2 className="text-2xl text-lotus-800 text-center" style={{ fontFamily: "var(--font-heading)" }}>{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const { data: allProducts } = await supabaseAdmin
    .from("products")
    .select("*, categories(name), product_photos(id, storage_path, video_url, approved, position)")
    .eq("published", true)
    .order("name");

  const products = allProducts || [];

  const selectionProducts = products.filter((p) => p.labels?.includes("selection_moment"));
  const collectionProducts = products.filter((p) => p.labels?.includes("collection_saisonniere"));

  // Group remaining by category
  const highlighted = new Set([...selectionProducts, ...collectionProducts].map((p) => p.id));
  const byCategory = {};
  for (const p of products) {
    if (highlighted.has(p.id)) continue;
    const cat = p.categories?.name || "Autres bijoux";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(p);
  }

  const inStockProducts = products.filter((p) => p.in_stock);

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
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
        {selectionProducts.length > 0 && (
          <Section title="✨ La sélection du moment" products={selectionProducts} />
        )}
        {collectionProducts.length > 0 && (
          <Section title="🌸 Collection saisonnière" products={collectionProducts} />
        )}
        {Object.entries(byCategory).map(([cat, ps]) => (
          <Section key={cat} title={cat} products={ps} />
        ))}
        {products.length === 0 && (
          <p className="text-center text-stone-400 py-24">Le catalogue arrive bientôt…</p>
        )}

        {inStockProducts.length > 0 && (
          <section className="bg-white rounded-3xl border border-stone-100 p-8 space-y-6 shadow-sm">
            <div className="text-center space-y-1">
              <h2 className="text-2xl text-lotus-800" style={{ fontFamily: "var(--font-heading)" }}>Faire une présélection</h2>
              <p className="text-sm text-stone-500 max-w-md mx-auto">
                Tu as flashé sur un ou plusieurs bijoux ? Envoie une présélection et Clara te recontacte pour organiser l&apos;échange.
              </p>
            </div>
            <PreselectionForm products={inStockProducts} />
          </section>
        )}
      </main>

      <footer className="text-center py-8 text-xs text-stone-400">
        © {new Date().getFullYear()} Le Lotus Bleu de Clara · Fait avec ♡
      </footer>
    </div>
  );
}
