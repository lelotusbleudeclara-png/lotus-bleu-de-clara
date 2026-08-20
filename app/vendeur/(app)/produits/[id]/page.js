export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { updateProduct, deleteProduct } from "@/lib/actions/products";
import { uploadPhoto, addVideoUrl, approvePhoto, unapprovePhoto, deletePhoto, setMainPhoto } from "@/lib/actions/photos";
import CategorySubcategorySelect from "@/components/CategorySubcategorySelect";
import PhotoUploader from "@/components/PhotoUploader";

function getYoutubeId(url) {
  const m = url?.match(/(?:youtu\.be\/|v=|\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

async function safeFetch(promise) {
  try { const r = await promise; return r.data || []; } catch { return []; }
}

export default async function ProduitEditPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const saved = sp?.saved === "1";

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

      {saved && (
        <div className="rounded-xl bg-lotus-50 border border-lotus-200 text-lotus-700 text-sm px-4 py-3">
          Modifications enregistrées avec succès.
        </div>
      )}

      <form action={updateProduct.bind(null, id)} className="space-y-5 bg-white rounded-2xl border border-stone-200 p-5">
        <CategorySubcategorySelect
          categories={categories}
          subcategories={subcategories}
          defaultCategoryId={product.category_id || ""}
          defaultSubcategoryId={product.subcategory_id || ""}
        />
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Prix (&#8364;)</label>
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
            placeholder="Ex. Ne pas mouiller, d&#233;conseill&#233; aux moins de 3 ans..."
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-stone-700 mb-1">Mettre en avant</label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" name="label_selection" defaultChecked={isSelection} className="rounded" /> La s&#233;lection du moment
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" name="label_collection" defaultChecked={isCollection} className="rounded" /> Collection saisonni&#232;re
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" name="published" defaultChecked={product.published} className="rounded" /> Publi&#233;
        </label>
        <button type="submit"
          className="w-full rounded-full bg-lotus-600 text-white text-sm font-medium px-5 py-2 hover:bg-lotus-700 transition">
          Enregistrer
        </button>
      </form>

      <form action={deleteProduct.bind(null, id)}>
        <button type="submit" className="text-sm text-red-500 hover:text-red-700">Supprimer ce produit</button>
      </form>

      <div className="space-y-4">
        <h2 className="text-lg text-lotus-800" style={{ fontFamily: "var(--font-heading)" }}>Photos &amp; vid&#233;os</h2>
        <PhotoUploader uploadAction={uploadPhoto.bind(null, id)} addVideoAction={addVideoUrl.bind(null, id)} />

        {photosWithUrl.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photosWithUrl.map((media) => (
              <div key={media.id}
                className="relative bg-white rounded-xl overflow-hidden border-2"
                style={{ borderColor: media.is_main ? "#1e58c2" : "#e7e5e4" }}>

                <div className="absolute top-1 left-1 right-1 z-10 flex items-start justify-between gap-1">
                  {!media.video_url && (
                    media.is_main
                      ? <span className="text-xs bg-lotus-600 text-white px-1.5 py-0.5 rounded-full font-medium leading-tight">
                          Principale
                        </span>
                      : <form action={setMainPhoto.bind(null, id, media.id)}>
                          <button type="submit"
                            className="text-xs bg-white/80 text-stone-600 px-1.5 py-0.5 rounded-full hover:bg-lotus-600 hover:text-white transition leading-tight">
                            Principale ?
                          </button>
                        </form>
                  )}
                  <form action={deletePhoto.bind(null, id, media.id, media.storage_path || "")} className="ml-auto">
                    <button type="submit"
                      className="w-5 h-5 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-red-600 transition">
                      X
                    </button>
                  </form>
                </div>

                {media.video_url ? (
                  <div className="w-full h-32 bg-stone-100">
                    {getYoutubeId(media.video_url)
                      ? <iframe src={"https://www.youtube.com/embed/" + getYoutubeId(media.video_url)} className="w-full h-32" allowFullScreen />
                      : <div className="flex items-center justify-center h-full text-xs text-stone-400">URL invalide</div>
                    }
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={media.url} alt="" className="w-full h-32 object-cover" />
                )}
                <div className="p-2 space-y-1">
                  <p className={"text-xs text-center px-2 py-0.5 rounded-full " + (media.approved ? "bg-lotus-100 text-lotus-700" : "bg-amber-100 text-amber-700")}>
                    {media.approved ? "Approuvé·e" : "En attente"}
                  </p>
                  <div className="flex justify-center text-xs">
                    {media.approved
                      ? <form action={unapprovePhoto.bind(null, id, media.id)}><button type="submit" className="text-stone-500 hover:text-stone-700">Retirer</button></form>
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
