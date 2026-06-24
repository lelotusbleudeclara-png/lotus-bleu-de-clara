import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { updateProduct, deleteProduct } from "@/lib/actions/products";
import { uploadPhoto, approvePhoto, unapprovePhoto, deletePhoto } from "@/lib/actions/photos";

export default async function ProduitEditPage({ params }) {
  const { id } = await params;

  const [{ data: product, error }, { data: categories }, { data: photos }] = await Promise.all([
    supabaseAdmin.from("products").select("*").eq("id", id).single(),
    supabaseAdmin.from("categories").select("id, name").order("name"),
    supabaseAdmin
      .from("product_photos")
      .select("*")
      .eq("product_id", id)
      .order("position"),
  ]);

  if (error || !product) notFound();

  const photosWithUrl = (photos || []).map((photo) => ({
    ...photo,
    url: supabaseAdmin.storage.from("product-photos").getPublicUrl(photo.storage_path).data
      .publicUrl,
  }));

  return (
    <div className="space-y-8 max-w-lg">
      <h1 className="text-2xl text-lotus-800" style={{ fontFamily: "var(--font-heading)" }}>
        Modifier : {product.name}
      </h1>

      <form
        action={updateProduct.bind(null, id)}
        className="space-y-4 bg-white rounded-2xl border border-stone-200 p-5"
      >
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Nom</label>
          <input
            type="text"
            name="name"
            required
            defaultValue={product.name}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={product.description || ""}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-stone-700 mb-1">Prix (€)</label>
            <input
              type="text"
              name="price"
              required
              defaultValue={product.price}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-stone-700 mb-1">Catégorie</label>
            <select
              name="category_id"
              defaultValue={product.category_id || ""}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500"
            >
              <option value="">— Sans catégorie —</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              name="in_stock"
              defaultChecked={product.in_stock}
              className="rounded"
            />
            En stock
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              name="published"
              defaultChecked={product.published}
              className="rounded"
            />
            Publié (visible sur le catalogue public)
          </label>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            className="rounded-full bg-lotus-600 text-white text-sm font-medium px-5 py-2 hover:bg-lotus-700 transition"
          >
            Enregistrer
          </button>
        </div>
      </form>

      <form action={deleteProduct.bind(null, id)}>
        <button type="submit" className="text-sm text-red-500 hover:text-red-700">
          Supprimer ce produit
        </button>
      </form>

      <div className="space-y-4">
        <h2 className="text-lg text-lotus-800" style={{ fontFamily: "var(--font-heading)" }}>
          Photos
        </h2>

        {product.published && photosWithUrl.filter((p) => p.approved).length === 0 && (
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            Ce produit est publié mais n&apos;a aucune photo approuvée : il n&apos;apparaîtra pas
            visuellement sur le catalogue public.
          </p>
        )}

        <form action={uploadPhoto.bind(null, id)} className="flex gap-2">
          <input
            type="file"
            name="photo"
            accept="image/*"
            required
            className="flex-1 text-sm"
          />
          <button
            type="submit"
            className="rounded-full bg-lotus-600 text-white text-sm font-medium px-4 py-2 hover:bg-lotus-700 transition whitespace-nowrap"
          >
            Ajouter une photo
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photosWithUrl.map((photo) => (
            <div key={photo.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" className="w-full h-32 object-cover" />
              <div className="p-2 space-y-1">
                <p
                  className={`text-xs text-center px-2 py-0.5 rounded-full ${
                    photo.approved ? "bg-lotus-100 text-lotus-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {photo.approved ? "Approuvée" : "En attente d'approbation"}
                </p>
                <div className="flex justify-between text-xs">
                  {photo.approved ? (
                    <form action={unapprovePhoto.bind(null, id, photo.id)}>
                      <button type="submit" className="text-stone-500 hover:text-stone-700">
                        Retirer
                      </button>
                    </form>
                  ) : (
                    <form action={approvePhoto.bind(null, id, photo.id)}>
                      <button type="submit" className="text-lotus-700 hover:text-lotus-900">
                        Approuver
                      </button>
                    </form>
                  )}
                  <form action={deletePhoto.bind(null, id, photo.id, photo.storage_path)}>
                    <button type="submit" className="text-red-500 hover:text-red-700">
                      Supprimer
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
