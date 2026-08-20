"use client";
import { useState, useTransition, useRef, useEffect } from "react";
import { createPreselection } from "@/lib/actions/public";

function getPublicUrl(path) {
  return `https://rivkfuwopkmfkvcqorcc.supabase.co/storage/v1/object/public/product-photos/${path}`;
}

function getYoutubeId(url) {
  const m = url?.match(/(?:youtu\.be\/|v=|\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function getThumb(product) {
  const approved = (product.product_photos || []).filter(p => p.approved);
  const main = approved.find(p => p.is_main && !p.video_url) || approved.find(p => !p.video_url);
  return main ? getPublicUrl(main.storage_path) : null;
}

// Simple markdown-ish renderer: **bold**, bullet lines
function RichText({ text }) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div className="space-y-1 text-sm text-stone-600">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;
        // Strip heading markers
        const stripped = trimmed.replace(/^#+\s*/, "");
        // Bullet
        const isBullet = /^[\*\-]\s/.test(stripped);
        const content = isBullet ? stripped.replace(/^[\*\-]\s/, "") : stripped;
        // Bold: replace **...** with <strong>
        const parts = content.split(/\*\*(.*?)\*\*/g);
        const rendered = parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p);
        if (isBullet) return (
          <div key={i} className="flex gap-1.5">
            <span className="text-lotus-400 flex-shrink-0">•</span>
            <span>{rendered}</span>
          </div>
        );
        return <p key={i}>{rendered}</p>;
      })}
    </div>
  );
}

function ProductModal({ product, onClose, onAdd, cartQty }) {
  const thumb = getThumb(product);
  const approvedVideos = (product.product_photos || []).filter(p => p.approved && p.video_url);
  const approvedPhotos = (product.product_photos || []).filter(p => p.approved && !p.video_url);
  const [qty, setQty] = useState(cartQty || 1);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-0">
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-wide">{product.categories?.name || "Bijou"}</p>
            <h2 className="text-xl text-stone-800 leading-snug mt-0.5" style={{ fontFamily: "var(--font-heading)" }}>{product.name}</h2>
          </div>
          <button onClick={onClose} className="ml-4 mt-1 text-stone-400 hover:text-stone-700 text-xl leading-none flex-shrink-0">✕</button>
        </div>

        {/* Photo */}
        {thumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt={product.name} className="w-full h-64 object-cover mt-4" />
        )}

        {/* Extra photos */}
        {approvedPhotos.length > 1 && (
          <div className="flex gap-2 px-5 pt-3 overflow-x-auto">
            {approvedPhotos.slice(1).map(p => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={getPublicUrl(p.storage_path)} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-stone-100" />
            ))}
          </div>
        )}

        {/* Videos */}
        {approvedVideos.map(v => (
          <div key={v.id} className="px-5 pt-3">
            <iframe src={`https://www.youtube.com/embed/${getYoutubeId(v.video_url)}`}
              className="w-full h-48 rounded-xl" allowFullScreen />
          </div>
        ))}

        {/* Details */}
        <div className="p-5 space-y-5">
          <p className="text-lg font-semibold text-lotus-700">{Number(product.price).toFixed(2)} €</p>

          {product.description && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-lotus-700 uppercase tracking-wider">Description</p>
              <RichText text={product.description} />
            </div>
          )}

          {product.conditions_utilisation && (
            <div className="space-y-2 border-t border-stone-100 pt-4">
              <p className="text-xs font-semibold text-lotus-700 uppercase tracking-wider">Conseils d&apos;entretien</p>
              <RichText text={product.conditions_utilisation} />
            </div>
          )}

          {/* Add to cart */}
          {product.in_stock ? (
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center border border-stone-200 rounded-full overflow-hidden">
                <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-3 py-2 text-stone-600 hover:bg-stone-50 text-lg leading-none">−</button>
                <span className="px-3 text-sm font-medium">{qty}</span>
                <button type="button" onClick={() => setQty(q => q + 1)}
                  className="px-3 py-2 text-stone-600 hover:bg-stone-50 text-lg leading-none">+</button>
              </div>
              <button
                onClick={() => { onAdd(product, qty); onClose(); }}
                className="flex-1 rounded-full bg-lotus-600 text-white text-sm font-medium px-5 py-2.5 hover:bg-lotus-700 transition">
                {cartQty ? "Mettre à jour" : "Ajouter à la sélection"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-stone-400 italic">Ce bijou est actuellement épuisé.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, onOpen, cartQty, onAdd }) {
  const thumb = getThumb(product);
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden flex flex-col">
      {/* Photo cliquable */}
      <button type="button" onClick={() => onOpen(product)} className="block w-full aspect-square bg-stone-50 overflow-hidden relative flex-shrink-0">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300 text-4xl">✦</div>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-medium text-stone-500 bg-white px-2 py-0.5 rounded-full border border-stone-200">Épuisé</span>
          </div>
        )}
        {cartQty > 0 && (
          <div className="absolute top-2 right-2 bg-lotus-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {cartQty}
          </div>
        )}
      </button>

      {/* Infos */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-2">
        <h3 className="text-sm text-stone-800 leading-snug line-clamp-2 min-h-[2.5rem]"
          style={{ fontFamily: "var(--font-heading)" }}>
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-lotus-700">{Number(product.price).toFixed(2)} €</p>
          {product.in_stock && (
            <button type="button" onClick={() => onAdd(product, 1)}
              className="text-xs rounded-full border border-lotus-300 text-lotus-700 px-3 py-1 hover:bg-lotus-50 transition">
              + Ajouter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PublicCatalog({ products }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState({});
  const [modal, setModal] = useState(null);
  const [isMinor, setIsMinor] = useState(false);
  const [done, setDone] = useState(null);
  const [formError, setFormError] = useState(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef(null);

  const categories = [...new Set(products.map(p => p.categories?.name).filter(Boolean))].sort();

  const filtered = activeCategory
    ? products.filter(p => p.categories?.name === activeCategory)
    : products;

  // Sections
  const selectionProducts = filtered.filter(p => p.labels?.includes("selection_moment"));
  const collectionProducts = filtered.filter(p => p.labels?.includes("collection_saisonniere"));
  const highlighted = new Set([...selectionProducts, ...collectionProducts].map(p => p.id));
  const byCategory = {};
  for (const p of filtered) {
    if (highlighted.has(p.id)) continue;
    const cat = p.categories?.name || "Autres bijoux";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(p);
  }

  function addToCart(product, qty) {
    setCart(prev => ({
      ...prev,
      [product.id]: { product, qty: (prev[product.id]?.qty || 0) + qty }
    }));
  }

  function setQty(productId, qty) {
    if (qty <= 0) {
      setCart(prev => { const n = { ...prev }; delete n[productId]; return n; });
    } else {
      setCart(prev => ({ ...prev, [productId]: { ...prev[productId], qty } }));
    }
  }

  const cartItems = Object.values(cart);
  const total = cartItems.reduce((s, { product, qty }) => s + Number(product.price) * qty, 0);

  function handleSubmit(e) {
    e.preventDefault();
    if (!cartItems.length) { setFormError("Ajoute au moins un bijou à ta sélection."); return; }
    const fd = new FormData(e.target);
    const items = cartItems.map(({ product, qty }) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      qty,
      line_total: (Number(product.price) * qty).toFixed(2),
    }));
    fd.set("items_json", JSON.stringify(items));
    setFormError(null);
    startTransition(async () => {
      try {
        const res = await createPreselection(fd);
        setDone(res);
        setCart({});
      } catch (err) {
        setFormError(err.message || "Une erreur est survenue.");
      }
    });
  }

  function ProductGrid({ products: ps }) {
    if (!ps?.length) return null;
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {ps.map(p => (
          <ProductCard key={p.id} product={p}
            cartQty={cart[p.id]?.qty || 0}
            onOpen={setModal}
            onAdd={addToCart}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Modal */}
      {modal && (
        <ProductModal
          product={modal}
          cartQty={cart[modal.id]?.qty || 0}
          onClose={() => setModal(null)}
          onAdd={addToCart}
        />
      )}

      {/* Category bar */}
      {categories.length > 0 && (
        <nav className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition border ${
              activeCategory === null
                ? "bg-lotus-700 text-white border-lotus-700"
                : "bg-white text-stone-600 border-stone-200 hover:border-lotus-300"
            }`}>
            Tout
          </button>
          {categories.map(cat => (
            <button key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition border ${
                activeCategory === cat
                  ? "bg-lotus-700 text-white border-lotus-700"
                  : "bg-white text-stone-600 border-stone-200 hover:border-lotus-300"
              }`}>
              {cat}
            </button>
          ))}
        </nav>
      )}

      {/* Sections */}
      {selectionProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl text-lotus-800 text-center" style={{ fontFamily: "var(--font-heading)" }}>✨ La sélection du moment</h2>
          <ProductGrid products={selectionProducts} />
        </section>
      )}
      {collectionProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl text-lotus-800 text-center" style={{ fontFamily: "var(--font-heading)" }}>🌸 Collection saisonnière</h2>
          <ProductGrid products={collectionProducts} />
        </section>
      )}
      {Object.entries(byCategory).map(([cat, ps]) => (
        <section key={cat} className="space-y-4">
          <h2 className="text-2xl text-lotus-800 text-center" style={{ fontFamily: "var(--font-heading)" }}>{cat}</h2>
          <ProductGrid products={ps} />
        </section>
      ))}
      {filtered.length === 0 && (
        <p className="text-center text-stone-400 py-24">Aucun produit dans cette catégorie.</p>
      )}

      {/* Cart + form */}
      <section className="bg-white rounded-3xl border border-stone-100 p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-1">
          <h2 className="text-2xl text-lotus-800" style={{ fontFamily: "var(--font-heading)" }}>Faire une présélection</h2>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            Tu as flashé sur un ou plusieurs bijoux ? Ajoute-les à ta sélection et envoie ta demande — Clara te recontacte pour organiser l&apos;échange.
          </p>
        </div>

        {done ? (
          <div className="text-center space-y-2 py-8">
            <p className="text-2xl">✓</p>
            <p className="text-lotus-700 font-medium">Présélection envoyée !</p>
            {done.isMinor
              ? <p className="text-sm text-stone-500">Un email de confirmation a été envoyé au parent ou tuteur. La commande sera finalisée après son accord.</p>
              : <p className="text-sm text-stone-500">Clara te recontactera très bientôt pour organiser l&apos;échange.</p>
            }
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">

            {/* Cart summary */}
            {cartItems.length > 0 ? (
              <div className="border border-stone-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-50 text-xs text-stone-400 uppercase tracking-wide">
                      <th className="text-left px-4 py-2 font-medium">Bijou</th>
                      <th className="text-center px-2 py-2 font-medium">Qté</th>
                      <th className="text-right px-4 py-2 font-medium">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map(({ product, qty }) => (
                      <tr key={product.id} className="border-t border-stone-100">
                        <td className="px-4 py-3 text-stone-700">{product.name}</td>
                        <td className="px-2 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button type="button" onClick={() => setQty(product.id, qty - 1)}
                              className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 text-xs flex items-center justify-center">−</button>
                            <span className="w-5 text-center text-stone-700">{qty}</span>
                            <button type="button" onClick={() => setQty(product.id, qty + 1)}
                              className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 text-xs flex items-center justify-center">+</button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-lotus-700">
                          {(Number(product.price) * qty).toFixed(2)} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-stone-200 bg-stone-50">
                      <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-stone-700">Total</td>
                      <td className="px-4 py-3 text-right text-base font-bold text-lotus-700">{total.toFixed(2)} €</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-stone-400 text-sm border border-dashed border-stone-200 rounded-xl">
                Clique sur &quot;+ Ajouter&quot; sur un bijou pour commencer ta sélection
              </div>
            )}

            {/* Buyer info */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Prénom et nom</label>
                <input type="text" name="buyer_name" required
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                <input type="email" name="buyer_email" required
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Téléphone (facultatif)</label>
                <input type="tel" name="buyer_phone"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
              <input type="checkbox" name="is_minor" checked={isMinor}
                onChange={e => setIsMinor(e.target.checked)} className="rounded" />
              Je suis mineur(e)
            </label>

            {isMinor && (
              <div className="space-y-3 bg-amber-50 rounded-xl p-4 border border-amber-100">
                <p className="text-xs text-amber-700">Un email de confirmation sera envoyé à ton parent ou tuteur avant la finalisation.</p>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Email du parent / tuteur</label>
                  <input type="email" name="parent_email" required={isMinor}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Téléphone du parent / tuteur (facultatif)</label>
                  <input type="tel" name="parent_phone"
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
                </div>
              </div>
            )}

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <button type="submit" disabled={isPending || !cartItems.length}
              className="w-full rounded-full bg-lotus-600 text-white text-sm font-medium px-5 py-3 hover:bg-lotus-700 transition disabled:opacity-40">
              {isPending ? "Envoi en cours…" : "Envoyer ma présélection"}
            </button>
          </form>
        )}
      </section>
    </>
  );
}
