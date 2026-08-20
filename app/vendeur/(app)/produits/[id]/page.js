export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { updateProduct, deleteProduct } from "@/lib/actions/products";
import { uploadPhoto, addVideoUrl, approvePhoto, unapprovePhoto, deletePhoto } from "@/lib/actions/photos";
import CategorySubcategorySelect from "@/components/CategorySubcategorySelect";
import PhotoUploader from "@/components/PhotoUploader";

function getYoutubeId(url) {
  const m = url?.match(/(?:youtu\.be\/|v=|\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

async function safeFetch(promise) {
  try { const r = await promise; return r.data || []; } catch { return []; }
}

export default async function ProduitEditPage({ params }) {
  const { id } = await params;

  const { data: product, error } = await supabaseAdmin.from("products").select("*").eq("id", id).single();
  if (error || !product) notFound();

  const [categories, subcategories, photos] = await Promise.all([
    safeFetch(supabaseAdmin.from("categories").select("id, name").order("name")),
    safeFetch(supabaseAdmin.from("subcategories").select("id, category_id, name").order("name")),
    safeFetch(supabaseAdmin.from("product_photos").select("*").eq("product_id", id).order("position")),
  ]);

  const photosWithUrl = photos.map((p) => ({
    ...p,
    url: p.video_url ? null : supabaseAdmin.storage.from("product-photos").getPublicUrl(p.storage_path).data.publicUrl,
  }));

  const isSelection = product.labels?.includes("selection_moment");
  const isCollection = product.labels?.includes("collection_saisonniere");

  return (
    <div className="space-y-8 max-w-lg">
      <h1 className="text-2xl text-lotus-800" style={{ fontFamily: "var(--font-heading)" }}>
        {product.name}
      </h1>

      <form action={updateProduct.bind(null, id)} className="space-y-5 bg-white rounded-2xl border border-stone-200 p-5">
        <CategorySubcategorySelect
          categories={categories}
          subcategories={subcategories}
          defaultCategoryId={product.category_id || ""}
          defaultSubcategoryId={product.subcategory_id || ""}
        />
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Prix (€)</label>
          <input type="text" name="price" required defaultValue={product.price}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
          <textarea name="description" rows={3} defaultValue={product.description || ""}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Nom du produit</label>
          <input type="text" name="name" required defaultValue={product.name}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
        </div>

        <hr className="border-stone-100" />
        <p className="text-xs text-stone-400 uppercase tracking-wide">Champs facultatifs</p>

        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" name="in_stock" defaultChecked={product.in_stock} className="rounded" /> En stock
        </label>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Conditions d&apos;utilisation</label>
          <textarea name="conditions_utilisation" rows={2} defaultValue={product.conditions_utilisation || ""}
            placeholder="Ex. Ne pas mouiller, déconseillé aux moins de 3 ans..."
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-stone-700 mb-1">Mettre en avant</label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" name="label_selection" defaultChecked={isSelection} className="rounded" /> ✨ La sélection du moment
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" name="label_collection" defaultChecked={isCollection} className="rounded" /> 🌸 Collection saisonnière
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" name="published" defaultChecked={product.published} className="rounded" /> Publié
        </label>
        <button type="submit"
          className="w-full rounded-full bg-lotus-600 text-white text-sm font-medium px-5 py-2 hover:bg-lotus-700 transition">
          Enregistrer
        </button>
      </form>

      <form action={deleteProduct.bind(null, id)}>
        <button type="submit" className="text-sm text-red-500 hover:text-red-700">Supprimer ce produit</button>
      </form>

      {/* Photos & vidéos */}
      <div className="space-y-4">
        <h2 className="text-lg text-lotus-800" style={{ fontFamily: "var(--font-heading)" }}>Photos &amp; vidéos</h2>
        <PhotoUploader uploadAction={uploadPhoto.bind(null, id)} addVideoAction={addVideoUrl.bind(null, id)} />

        {photosWithUrl.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photosWithUrl.map((media) => (
              <div key={media.id} className="relative bg-white rounded-xl border border-stone-200 overflow-hidden group">
                {/* × delete button overlay */}
                <form action={deletePhoto.bind(null, id, media.id, media.storage_path)}
                  className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition">
                  <button type="submit"
                    className="w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-red-600 transition"
                    title="Supprimer">
                    ×
                  </button>
                </form>

                {media.video_url ? (
                  <div className="w-full h-32 bg-stone-100">
                    {getYoutubeId(media.video_url) ? (
                      <iframe src={`https://www.youtube.com/embed/${getYoutubeId(media.video_url)}`} className="w-full h-32" allowFullScreen />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-stone-400">URL invalide</div>
                    )}
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={media.url} alt="" className="w-full h-32 object-cover" />
                )}
                <div className="p-2 space-y-1">
                  <p className={`text-xs text-center px-2 py-0.5 rounded-full ${media.approved ? "bg-lotus-100 text-lotus-700" : "bg-amber-100 text-amber-700"}`}>
                    {media.approved ? "Approuvé·e" : "En attente"}
                  </p>
                  <div className="flex justify-center text-xs">
                    {media.approved
                      ? <form action={unapprovePhoto.bind(null, id, media.id)}><button type="submit" className="text-stone-500 hover:text-stone-700">Retirer l&apos;approbation</button></form>
                      : <form action={approvePhoto.bind(null, id, media.id)}><button type="submit" className="text-lotus-700 hover:text-lotus-900">Approuver</button></form>
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
